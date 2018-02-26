import "jest";
import { GitGraph, TemplateEnum, OrientationsEnum } from "../gitgraph";

describe("GitGraph", () => {
  class G extends GitGraph { public render(): void { return null; } }

  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitGraph = new G();

      expect(gitgraph.options).toMatchObject({
        author: "Sergio Flores <saxo-guy@epic.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: false,
      });
    });

    it("should be able to override options", () => {
      const gitgraph: GitGraph = new G({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        reverseArrow: true,
        template: TemplateEnum.Metro,
      });

      expect(gitgraph.options).toMatchObject({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: true,
        template: "metro",
      });
    });
  });

  describe("commit", () => {
    describe("initial commit", () => {
      it("should add the initial commit", () => {
        const gitgraph: GitGraph = new G();

        gitgraph.commit({ subject: "Initial commit" });

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit).toMatchObject({
          subject: "Initial commit",
          author: {
            name: "Sergio Flores",
            email: "saxo-guy@epic.com",
          },
          committer: {
            name: "Sergio Flores",
            email: "saxo-guy@epic.com",
          },
          refs: ["master", "HEAD"],
        });
      });

      it("should add the initial commit with another author", () => {
        const gitgraph: GitGraph = new G();

        gitgraph.commit({ subject: "Initial commit", author: "Fabien BERNARD <fabien0102@gmail.com>" });

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit).toMatchObject({
          subject: "Initial commit",
          refs: ["master", "HEAD"],
          author: {
            name: "Fabien BERNARD",
            email: "fabien0102@gmail.com",
          },
          committer: {
            name: "Fabien BERNARD",
            email: "fabien0102@gmail.com",
          },
        });
      });

      it("should works with the shorter commit message syntax", () => {
        const gitgraph: GitGraph = new G();

        gitgraph.commit("Initial commit");

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("Initial commit");
      });

      it("should works without argument (default message)", () => {
        const gitgraph = new G();
        gitgraph.commit();

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("He doesn't like George Michael! Boooo!");
      });
    });

    describe("two commits", () => {
      let one, two;
      beforeEach(() => {
        const gitgraph: GitGraph = new G();

        gitgraph
          .commit("Initial commit")
          .commit("Second commit");

        [one, two] = gitgraph.log();
      });

      it("should set the HEAD/master refs to the last commit", () => {
        expect(one.subject).toBe("Initial commit");
        expect(one.refs).toEqual([]);

        expect(two.subject).toBe("Second commit");
        expect(two.refs).toEqual(["master", "HEAD"]);
      });

      it("should have the first commit as parent refs", () => {
        expect(two.parents).toEqual([one.commit]);
        expect(two.parentsAbbrev).toEqual([one.commitAbbrev]);
      });
    });
  });

  describe("withPosition", () => {
    it("should deal with 3 straight commits", () => {
      const gitgraph: GitGraph = new G();

      gitgraph.commit().commit().commit();

      const log = gitgraph.log();
      const [one, two, three] = log;

      expect(one).toMatchObject({
        x: 0,
        y: 160,
      });
      expect(two).toMatchObject({
        x: 0,
        y: 80,
      });
      expect(three).toMatchObject({
        x: 0,
        y: 0,
      });
    });

    it("should deal with 3 straight commits (reverse)", () => {
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.VerticalReverse });

      gitgraph.commit().commit().commit();

      const log = gitgraph.log();
      const [one, two, three] = log;

      expect(one).toMatchObject({
        x: 0,
        y: 0,
      });
      expect(two).toMatchObject({
        x: 0,
        y: 80,
      });
      expect(three).toMatchObject({
        x: 0,
        y: 160,
      });
    });

    it("should deal with 3 straight commits (horizontal)", () => {
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.Horizontal });

      gitgraph.commit().commit().commit();

      const log = gitgraph.log();
      const [one, two, three] = log;

      expect(one).toMatchObject({
        x: 0,
        y: 0,
      });
      expect(two).toMatchObject({
        x: 80,
        y: 0,
      });
      expect(three).toMatchObject({
        x: 160,
        y: 0,
      });
    });

    it("should deal with 3 straight commits (horizontal-reverse)", () => {
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.HorizontalReverse });

      gitgraph.commit().commit().commit();

      const log = gitgraph.log();
      const [one, two, three] = log;

      expect(one).toMatchObject({
        x: 160,
        y: 0,
      });
      expect(two).toMatchObject({
        x: 80,
        y: 0,
      });
      expect(three).toMatchObject({
        x: 0,
        y: 0,
      });
    });
  });
});

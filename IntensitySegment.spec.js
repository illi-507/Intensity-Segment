const IntensitySegments = require("./IntensitySegment");

describe("add function", () => {
  test("should return an empty segment list initially", () => {
    const seg = new IntensitySegments();
    expect(seg.toString()).toBe("[]");
  });

  test("should correctly add intensity over [10, 30) with amount 1", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    expect(seg.toString()).toBe("[[10,1],[30,0]]");
  });

  test("should correctly add overlapping range [20, 40) after [10, 30)", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    seg.add(20, 40, 1);
    expect(seg.toString()).toBe("[[10,1],[20,2],[30,1],[40,0]]");
  });

  test("should handle cancellation by adding negative intensity over entire [10, 40)", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    seg.add(20, 40, 1);
    seg.add(10, 40, -1);
    expect(seg.toString()).toBe("[[20,1],[30,0]]");
  });

  test("should reflect additional negative intensity when repeating Add(10, 40, -1)", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    seg.add(20, 40, 1);
    seg.add(10, 40, -1);
    seg.add(10, 40, -1);
    expect(seg.toString()).toBe("[[10,-1],[20,0],[30,-1],[40,0]]");
  });
});

describe("set function", () => {
  test("should override [15, 30) with intensity 5 while preserving outer segments", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    seg.add(20, 40, 1);
    seg.set(15, 30, 5);
    expect(seg.toString()).toBe("[[10,1],[15,5],[30,1],[40,0]]");
  });

  test("should fully override [10, 40) with intensity 3", () => {
    const seg = new IntensitySegments();
    seg.add(10, 30, 1);
    seg.add(20, 40, 2);
    seg.set(10, 40, 3);
    expect(seg.toString()).toBe("[[10,3],[40,0]]");
  });

  test("should correctly split a segment when setting [20, 30) to 5", () => {
    const seg = new IntensitySegments();
    seg.add(10, 50, 1);
    seg.set(20, 30, 5);
    expect(seg.toString()).toBe("[[10,1],[20,5],[30,1],[50,0]]");
  });
});

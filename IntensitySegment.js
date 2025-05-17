/**
 * A class that tracks and manipulates intensity segments.
 * Internally uses a difference map to manage range updates.
 * Supports update functions:`add` and `set`
 *
 * @class
 */
function IntensitySegments() {
  /**
   * A map storing position => change.
   * Only stores where values change.
   * @type {Map<number, number>}
   */
  this.map = new Map();

  /**
   * Flag to track whether the internal map has been modified.
   * Used to control caching behavior.
   * @type {boolean}
   */
  this.recordModified = false;

  /**
   * Cached version of the sorted map.
   * @type {Array<[number, number]>}
   */
  this.segmentsCache = [];

  /**
   * Adds an intensity amount to a range [from, to).
   * Values are incremented by `amount`.
   *
   * @param {number} from - Start of the range (inclusive).
   * @param {number} to - End of the range (exclusive).
   * @param {number} amount - The intensity amount to add.
   */
  this.add = function (from, to, amount) {
    this.recordModified = true;

    this.map.set(from, amount + (this.map.get(from) || 0));
    this.map.set(to, -amount + (this.map.get(to) || 0));
  };

  /**
   * Sets the intensity value for a specific range [from, to), replacing all existing values.
   * Removes overlaps in the specified range and then inserts the new value.
   *
   * @param {number} from - Start of the range (inclusive).
   * @param {number} to - End of the range (exclusive).
   * @param {number} amount - The new intensity value to apply to the range.
   */
  this.set = function (from, to, amount) {
    this.recordModified = true;
    const segments = JSON.parse(this.toString());
    this.map.clear();

    for (let i = 0; i < segments.length - 1; i++) {
      const [start, val] = segments[i];
      const [end] = segments[i + 1];

      if (end <= from || start >= to) {
        this.add(start, end, val);
      } else {
        if (start < from) {
          this.add(start, from, val);
        }
        if (end > to) {
          this.add(to, end, val);
        }
      }
    }
    this.add(from, to, amount);
  };

  /**
   * Converts the internal map to a segment list.
   * Result is cached for efficiency until modified again.
   *
   * @returns {string} A stringified array of segments in the form [[start1, value1], [start2, value2], ...]
   */
  this.toString = function () {
    let array;
    if (this.recordModified) {
      array = Array.from(this.map.entries()).sort((a, b) => a[0] - b[0]);
      this.segmentsCache = array;
    } else {
      array = this.segmentsCache;
    }

    let result = [];
    let sum = 0;
    let prevSum = 0;

    for (let [position, amount] of array) {
      sum += amount;
      if (sum !== prevSum) {
        result.push([position, sum]);
        prevSum = sum;
      }
    }

    this.recordModified = false;
    const segRecord = JSON.stringify(result);
    return segRecord;
  };
}

module.exports = IntensitySegments;

// Implementation 1: Iterative approach using a for loop
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Implementation 2: Mathematical formula approach (Gauss's formula)
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

// Implementation 3: Recursive approach
var sum_to_n_c = function (n) {
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_c(n - 1);
};

// Export functions for testing
module.exports = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};

// Simple demo when run directly
if (require.main === module) {
  console.log("sum_to_n_a(5) =", sum_to_n_a(5)); // Expected: 15
  console.log("sum_to_n_b(5) =", sum_to_n_b(5)); // Expected: 15
  console.log("sum_to_n_c(5) =", sum_to_n_c(5)); // Expected: 15
}

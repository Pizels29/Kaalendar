// Simple test framework for unit testing
class TestFramework {
    constructor() {
        this.tests = [];
        this.passCount = 0;
        this.failCount = 0;
        this.coverage = {
            total: 0,
            tested: 0
        };
    }

    // Run all registered tests
    runTests() {
        console.log('Starting test execution...');

        this.tests.forEach(test => {
            try {
                test.fn();
                this.passCount++;
                this.renderTest(test.suite, test.name, true);
            } catch (error) {
                this.failCount++;
                this.renderTest(test.suite, test.name, false, error);
            }
        });

        this.renderSummary();
    }

    // Render individual test result
    renderTest(suite, name, passed, error = null) {
        const resultsDiv = document.getElementById('testResults');

        // Find or create suite container
        let suiteDiv = document.querySelector(`[data-suite="${suite}"]`);
        if (!suiteDiv) {
            suiteDiv = document.createElement('div');
            suiteDiv.className = 'test-suite';
            suiteDiv.setAttribute('data-suite', suite);
            suiteDiv.innerHTML = `<h2>${suite}</h2>`;
            resultsDiv.appendChild(suiteDiv);
        }

        // Add test result
        const testDiv = document.createElement('div');
        testDiv.className = `test ${passed ? 'pass' : 'fail'}`;
        testDiv.innerHTML = `
            <strong>${passed ? '✓' : '✗'} ${name}</strong>
            ${error ? `<div class="error-details">${error.message}</div>` : ''}
        `;
        suiteDiv.appendChild(testDiv);
    }

    // Render test summary
    renderSummary() {
        document.getElementById('passCount').textContent = this.passCount;
        document.getElementById('failCount').textContent = this.failCount;

        const total = this.passCount + this.failCount;
        const coverage = total > 0 ? Math.round((this.passCount / total) * 100) : 0;
        document.getElementById('coverage').textContent = `${coverage}%`;
    }
}

// Test suite registration
const testFramework = new TestFramework();

function describe(suiteName, fn) {
    const suite = {
        name: suiteName,
        tests: []
    };

    const it = (testName, testFn) => {
        testFramework.tests.push({
            suite: suiteName,
            name: testName,
            fn: testFn
        });
    };

    fn(it);
}

// Assertion helpers
const assert = {
    equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
        }
    },

    deepEqual(actual, expected, message = '') {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new Error(`${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
        }
    },

    notEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(`${message}\nExpected values to not be equal`);
        }
    },

    truthy(value, message = '') {
        if (!value) {
            throw new Error(`${message}\nExpected truthy value, got: ${value}`);
        }
    },

    falsy(value, message = '') {
        if (value) {
            throw new Error(`${message}\nExpected falsy value, got: ${value}`);
        }
    },

    throws(fn, message = '') {
        let thrown = false;
        try {
            fn();
        } catch (e) {
            thrown = true;
        }
        if (!thrown) {
            throw new Error(`${message}\nExpected function to throw an error`);
        }
    },

    isArray(value, message = '') {
        if (!Array.isArray(value)) {
            throw new Error(`${message}\nExpected array, got: ${typeof value}`);
        }
    },

    isObject(value, message = '') {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error(`${message}\nExpected object, got: ${typeof value}`);
        }
    },

    hasProperty(obj, prop, message = '') {
        if (!obj.hasOwnProperty(prop)) {
            throw new Error(`${message}\nExpected object to have property: ${prop}`);
        }
    },

    greaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new Error(`${message}\nExpected ${actual} to be greater than ${expected}`);
        }
    },

    lessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new Error(`${message}\nExpected ${actual} to be less than ${expected}`);
        }
    },

    includes(array, value, message = '') {
        if (!array.includes(value)) {
            throw new Error(`${message}\nExpected array to include: ${value}`);
        }
    }
};

// Run tests when page loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        testFramework.runTests();
    }, 100);
});

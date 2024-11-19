// fetchData.js

// Function to fetch JSON data from the backend
async function fetchLiftData() {
    try {
        const response = await fetch('http://localhost:3000/get-overload-status');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse JSON response
        console.log('Fetched Lift Data:', data); // Debugging log
        return data;
    } catch (error) {
        console.error('Error fetching Lift Data:', error);
        return null;
    }
}

// Export the function for use in other files
export { fetchLiftData };

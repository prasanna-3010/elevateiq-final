const lifts = {
    lift1: {
        currentFloor: 2, // Static or predefined floor
        isOverloaded: false // Dynamically fetched
    },
    lift2: {
        currentFloor: 1, // Manually set
        isOverloaded: true// Manually set
    },
    lift3: {
        currentFloor: 2, // Manually set
        isOverloaded: true // Manually set
    },
    lift4: {
        currentFloor: 1, // Manually set
        isOverloaded: false // Manually set
    }
};

// Function to fetch Lift 1's `isOverloaded` status from the backend
function fetchLift1Status() {
    fetch('http://localhost:3000/get-overload-status') // Replace with your server's endpoint
        .then(response => response.json())
        .then(data => {
            // Update Lift 1's `isOverloaded` status
            lifts.lift1.isOverloaded = data.isOverloaded;

            // Update Lift 1's UI
            updateLiftUI(1);
        })
        .catch(error => console.error('Error fetching Lift 1 data:', error));
}

// Function to update the UI for a specific lift
function updateLiftUI(liftNumber) {
    const lift = lifts[`lift${liftNumber}`];
    document.getElementById(`current-floor-${liftNumber}`).innerText = lift.currentFloor;
    const liftStatus = document.getElementById(`lift-status-${liftNumber}`);

    if (lift.isOverloaded) {
        liftStatus.innerText = 'Overloaded';
        liftStatus.classList.remove('normal');
        liftStatus.classList.add('overloaded');
    } else {
        liftStatus.innerText = 'Normal';
        liftStatus.classList.remove('overloaded');
        liftStatus.classList.add('normal');
    }
    moveLift(liftNumber, lift.currentFloor); // Visually move the lift
}

// Function to fetch and update all lifts
function fetchLiftData() {
    // Fetch Lift 1 status dynamically
    
    fetchLift1Status();

    // Manually update Lifts 2, 3, and 4
    for (let i = 1; i <= 4; i++) {
        updateLiftUI(i);
    }

    // Recommend the best lift based on the user's floor
    recommendLift(lifts);
}

// Function to move the lift based on the current floor
function moveLift(liftNumber, floor) {
    const liftBox = document.getElementById(`lift-box-${liftNumber}`);
    let position = '0px';

    switch (floor) {
        case 6:
            position = '600px';
            break;
        case 5:
            position = '500px';
            break;
        case 4:
            position = '400px';
            break;
        case 3:
            position = '300px';
            break;
        case 2:
            position = '200px';
            break;
        case 1:
            position = '100px';
            break;
        case 0:
            position = '0px';
            break;
        default:
            console.error('Invalid floor');
    }

    liftBox.style.bottom = position;
}

// Function to recommend the best lift based on status
function recommendLift(lifts) {
    let recommendedLift = null;
    let closestFloor = Infinity;

    // Get the user's current floor from the dropdown
    const userFloor = getUserFloor();

    // Find the closest lift that is not overloaded
    for (let i = 1; i <= 4; i++) {
        const lift = lifts[`lift${i}`];
        if (!lift.isOverloaded) {
            const distance = Math.abs(lift.currentFloor - userFloor);
            if (distance < closestFloor) {
                closestFloor = distance;
                recommendedLift = i;
            }
        }
    }

    // Display the recommended lift
    const recommendationElement = document.getElementById('recommended-lift');
    if (recommendedLift !== null) {
        recommendationElement.innerText = `Lift ${recommendedLift}`;
    } else {
        recommendationElement.innerText = "No lifts available";
    }
}

// Function to get the user's current floor from the dropdown
function getUserFloor() {
    const userFloorSelect = document.getElementById("user-floor");
    return parseInt(userFloorSelect.value); // Get selected floor as an integer
}

// Trigger the data fetch and recommendation when the user selects a floor
function onFloorChange() {
    fetchLiftData(); // Recalculate the best lift based on the new user floor
}

// Initial fetch on page load and periodic updates
fetchLiftData();
setInterval(fetchLiftData, 5000); // Update Lift 1's status every 5 seconds

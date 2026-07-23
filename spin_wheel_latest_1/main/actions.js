if (sessionStorage.getItem('wheel_data') && window.location.pathname.endsWith('condition_selection.php')) {

    let rawData = [];
    let availableNationalities = [];
    let nationalityCounts = {};

    const tableBody = document.getElementById("prizeTableBody");
    const addRowBtn = document.getElementById("addRowBtn");
    const submitBtn = document.getElementById("submitBtn");
    const clearBtn = document.getElementById("clearBtn");

    // Elements for showing saved storage data
    const selectedWheelContainer = document.getElementById("selectedWheelContainer");
    const selectedWheelDataDisplay = document.getElementById("selectedWheelDataDisplay");
    const goToSpinWheelBtn = document.getElementById("goToSpinWheelBtn");

    // 1. Fetch data from sessionStorage
    const storedWheelData = sessionStorage.getItem("wheel_data");

    if (storedWheelData) {
        try {
            const parsedData = JSON.parse(storedWheelData);
            rawData = Array.isArray(parsedData) ? parsedData : (parsedData.data || []);

            nationalityCounts = {};
            rawData.forEach(item => {
                const nat = item.nationality;
                if (nat !== null && nat !== undefined && String(nat).trim() !== "") {
                    nationalityCounts[nat] = (nationalityCounts[nat] || 0) + 1;
                }
            });

            availableNationalities = Object.keys(nationalityCounts).sort();

            if (Array.isArray(parsedData.prizes) && parsedData.prizes.length > 0) {
                parsedData.prizes.forEach(prize => addRow(prize.amount, prize.nationality));
            } else {
                addRow();
            }
        } catch (err) {
            console.error("Error parsing wheel_data from sessionStorage:", err);
            addRow();
        }
    } else {
        console.warn("No wheel_data found in sessionStorage.");
        addRow();
    }

    // 2. Load and render selected_wheel_data on page reload
    const storedSelectedData = sessionStorage.getItem("selected_wheel_data");

    if (storedSelectedData && selectedWheelContainer && selectedWheelTableBody) {
        try {
            const parsedSelectedData = JSON.parse(storedSelectedData);

            if (Array.isArray(parsedSelectedData) && parsedSelectedData.length > 0) {
                // Display the container
                selectedWheelContainer.style.display = "block";

                // Clear any old rows
                selectedWheelTableBody.innerHTML = "";

                // Populate the display table row by row
                parsedSelectedData.forEach((item, index) => {
                    const tr = document.createElement("tr");

                    const tdIndex = document.createElement("td");
                    tdIndex.textContent = index + 1;

                    const tdNat = document.createElement("td");
                    tdNat.textContent = item.nationality || "-";

                    const tdAmount = document.createElement("td");
                    tdAmount.textContent = item.amount || "0";

                    tr.appendChild(tdIndex);
                    tr.appendChild(tdNat);
                    tr.appendChild(tdAmount);

                    selectedWheelTableBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error("Error parsing selected_wheel_data for display table:", err);
        }
    }

    // Function to add table rows
    function addRow(amount = "", selectedNat = "") {
        const row = document.createElement("tr");

        const cellIndex = document.createElement("td");
        const inputAmount = document.createElement("input");
        inputAmount.type = "number";
        inputAmount.min = "1";
        inputAmount.placeholder = "Enter amount";
        inputAmount.value = amount;
        inputAmount.className = "prize-amount";
        cellIndex.appendChild(inputAmount);

        const cellNat = document.createElement("td");
        const select = document.createElement("select");
        select.className = "nat-select";

        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Select --";
        select.appendChild(defaultOption);

        availableNationalities.forEach(nat => {
            const opt = document.createElement("option");
            opt.value = nat;
            opt.textContent = nat;
            if (nat === selectedNat) opt.selected = true;
            select.appendChild(opt);
        });
        cellNat.appendChild(select);

        const cellTotal = document.createElement("td");
        cellTotal.className = "nat-count";

        const updateCount = () => {
            const nat = select.value;
            cellTotal.textContent = nat ? (nationalityCounts[nat] || 0) : 0;
        };

        updateCount();
        select.addEventListener("change", updateCount);

        const cellAction = document.createElement("td");
        cellAction.classList.add("action-cell");
        const delBtn = document.createElement("button");
        delBtn.classList.add("btn-delete");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
            row.remove();
        };
        cellAction.appendChild(delBtn);

        row.appendChild(cellIndex);
        row.appendChild(cellNat);
        row.appendChild(cellTotal);
        row.appendChild(cellAction);

        tableBody.appendChild(row);
    }

    if (addRowBtn) {
        addRowBtn.addEventListener("click", () => addRow());
    }

    // 3. Submit Configuration handler
    if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const rows = Array.from(tableBody.rows);

            if (rows.length === 0) {
                alert("Please add at least one prize row.");
                return;
            }

            let hasEmptyFields = false;
            const requestedTotals = {};

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const amountVal = row.querySelector(".prize-amount").value.trim();
                const selectedNat = row.querySelector(".nat-select").value;
                const parsedAmount = parseInt(amountVal, 10);

                if (!amountVal || isNaN(parsedAmount) || parsedAmount <= 0 || !selectedNat) {
                    hasEmptyFields = true;
                    break;
                }

                requestedTotals[selectedNat] = (requestedTotals[selectedNat] || 0) + parsedAmount;
            }

            if (hasEmptyFields) {
                alert("Please fill in all fields with valid prize amounts (greater than 0) and selected nationalities.");
                return;
            }

            const exceededErrors = [];
            Object.keys(requestedTotals).forEach(nat => {
                const maxAvailable = nationalityCounts[nat] || 0;
                const requested = requestedTotals[nat];

                if (requested > maxAvailable) {
                    exceededErrors.push(`- ${nat}: Requested ${requested} prize(s), but only ${maxAvailable} person(s) exist.`);
                }
            });

            if (exceededErrors.length > 0) {
                alert("Prize capacity exceeded:\n" + exceededErrors.join("\n"));
                return;
            }

            // Prepare array of configured prizes
            const payload = rows.map((row) => ({
                amount: parseInt(row.querySelector(".prize-amount").value, 10),
                nationality: row.querySelector(".nat-select").value
            }));

            try {
                // Save configured payload into selected_wheel_data
                sessionStorage.setItem("selected_wheel_data", JSON.stringify(payload));

                // Reload page to display the new div and navigation button
                window.location.reload();
            } catch (err) {
                console.error("Error saving prizes configuration to sessionStorage:", err);
                alert("Failed to save prizes configuration locally: " + err.message);
            }
        });
    }

    // 4. Redirect to spin_wheel.php handler
    if (goToSpinWheelBtn) {
        goToSpinWheelBtn.addEventListener("click", () => {
            window.location.href = "spin_wheel.php";
        });
    }

    // 5. Clear Data handler
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (!confirm("Are you sure you want to clear all data and reset?")) {
                return;
            }

            sessionStorage.removeItem("wheel_data");
            sessionStorage.removeItem("selected_wheel_data");
            window.location.href = "index.php";
        });
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (sessionStorage.getItem('selected_wheel_data') && window.location.pathname.endsWith('spin_wheel.php')) {

    let wheelPool = [];
    let winnersList = [];
    let prizeQueue = [];
    let currentAngle = 0;
    let isSpinning = false;

    const canvas = document.getElementById("wheelCanvas");
    const ctx = canvas.getContext("2d");
    const spinBtn = document.getElementById("spinBtn");

    // Single Winner Modal Elements
    const winnerModal = document.getElementById("winnerModal");
    const modalWinnerText = document.getElementById("modalWinnerText");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Dashboard Modal Elements
    const dashboardModal = document.getElementById("dashboardModal");
    const dashboardTableContainer = document.getElementById("dashboardTableContainer");
    const finishBtn = document.getElementById("finishBtn");

    // Read data synchronously from sessionStorage
    // Read data synchronously from sessionStorage
    function initWheelData() {
        try {
            const rawWheelData = sessionStorage.getItem("wheel_data");
            const rawSelectedWheelData = sessionStorage.getItem("selected_wheel_data");

            wheelPool = rawWheelData ? JSON.parse(rawWheelData) : [];
            const config = rawSelectedWheelData ? JSON.parse(rawSelectedWheelData) : [];

            // Debug logging:
            console.log("Loaded wheel pool count:", wheelPool.length);
            console.log("Loaded names:", wheelPool.map(item => item.name));
            console.log("loaded config", config);

            // 1. Extract unique target nationalities from config
            const targetNationalities = new Set(
                Array.isArray(config) ? config.map(cfg => cfg.nationality) : []
            );

            // 2. Filter wheelPool and map to names
            const matchingNames = wheelPool
                .filter(item => targetNationalities.has(item.nationality))
                .map(item => item.name);

            console.log("Matching names by nationality:", matchingNames);

            prizeQueue = [];
            if (Array.isArray(config)) {
                config.forEach(cfg => {
                    const count = parseInt(cfg.amount, 10) || 1;
                    for (let i = 0; i < count; i++) {
                        prizeQueue.push({
                            nationality: cfg.nationality,
                            prizeAmount: cfg.amount
                        });
                    }
                });
            }

            drawWheel();
        } catch (err) {
            console.error("Error loading wheel data from sessionStorage:", err);
        }
    }

    // Execute initialization
    initWheelData();

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (wheelPool.length === 0) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;
        const sliceAngle = (2 * Math.PI) / wheelPool.length;
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

        wheelPool.forEach((item, index) => {
            const startAngle = currentAngle + index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#000";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(item.name, radius - 20, 6);
            ctx.restore();
        });

        // Pointer
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY - radius - 15);
        ctx.lineTo(centerX + 15, centerY - radius - 15);
        ctx.lineTo(centerX, centerY - radius + 15);
        ctx.closePath();
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.stroke();
    }

    if (spinBtn) {
        spinBtn.addEventListener("click", () => {
            if (isSpinning || wheelPool.length === 0) return;

            const currentDrawIndex = winnersList.length;

            if (prizeQueue.length > 0 && currentDrawIndex >= prizeQueue.length) {
                showDashboardPopup();
                return;
            }

            const currentPrizeConfig = prizeQueue[currentDrawIndex];
            const targetNationality = currentPrizeConfig?.nationality;

            const eligibleIndices = wheelPool
                .map((item, index) => (item.nationality === targetNationality ? index : -1))
                .filter(index => index !== -1);

            if (eligibleIndices.length === 0) {
                alert(`No eligible candidates found for Draw ${currentDrawIndex + 1} (${targetNationality || "Unspecified"}).`);
                return;
            }

            isSpinning = true;
            spinBtn.disabled = true;

            const targetWinnerIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
            const sliceAngle = (2 * Math.PI) / wheelPool.length;
            const pointerAngle = 1.5 * Math.PI;
            const targetSliceCenterAngle = (targetWinnerIndex + 0.5) * sliceAngle;

            const extraRounds = (Math.floor(Math.random() * 4) + 5) * 2 * Math.PI;
            const targetAngle = extraRounds + (pointerAngle - targetSliceCenterAngle);

            const duration = 4000;
            const startAngle = currentAngle;
            const angleChange = targetAngle - (startAngle % (2 * Math.PI));
            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOut = 1 - Math.pow(1 - progress, 3);
                currentAngle = startAngle + angleChange * easeOut;

                drawWheel();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isSpinning = false;

                    const winningItem = wheelPool[targetWinnerIndex];
                    winnersList.push({
                        drawNumber: winnersList.length + 1,
                        id: winningItem.id || winningItem.ID || "N/A",
                        name: winningItem.name,
                        nationality: winningItem.nationality,
                        prizeAmount: currentPrizeConfig.prizeAmount
                    });

                    wheelPool.splice(targetWinnerIndex, 1);

                    // Check if all prizes are awarded
                    if (prizeQueue.length > 0 && winnersList.length >= prizeQueue.length) {
                        spinBtn.disabled = true;
                        spinBtn.textContent = "Completed";

                        showWinnerPopup(winningItem.name, winningItem.nationality, true);
                    } else {
                        spinBtn.disabled = false;
                        showWinnerPopup(winningItem.name, winningItem.nationality, false);
                    }
                }
            }

            requestAnimationFrame(animate);
        });
    }

    // Modal Handlers
    let isFinalDraw = false;

    function showWinnerPopup(name, nationality, isLast) {
        isFinalDraw = isLast;
        modalWinnerText.textContent = `${name} (${nationality})`;
        winnerModal.classList.add("show");
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            winnerModal.classList.remove("show");
            if (isFinalDraw) {
                showDashboardPopup();
            }
        });
    }

    function showDashboardPopup() {
        dashboardTableContainer.innerHTML = `
        <table border="1" style="width:100%; border-collapse:collapse; color: var(--text-primary);">
            <thead>
                <tr>
                    <th style="padding: 8px;">Draw #</th>
                    <th style="padding: 8px;">ID</th>
                    <th style="padding: 8px;">Name</th>
                    <th style="padding: 8px;">Nationality</th>
                </tr>
            </thead>
            <tbody>
                ${winnersList.map(w => `
                    <tr>
                        <td style="padding: 8px;">${w.drawNumber}</td>
                        <td style="padding: 8px;">${w.id}</td>
                        <td style="padding: 8px;">${w.name}</td>
                        <td style="padding: 8px;">${w.nationality}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
        dashboardModal.classList.add("show");
    }

    if (finishBtn) {
        finishBtn.addEventListener("click", () => {
            const dashboardModal = document.getElementById("dashboardModal");
            if (dashboardModal) {
                dashboardModal.style.display = "none";
            }
        });
    }
}
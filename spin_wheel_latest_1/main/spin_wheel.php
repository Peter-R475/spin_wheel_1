<script>

    if (!sessionStorage.getItem('wheel_data')) {
        window.location.href = 'index.php';
    }
</script>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Spinning Wheel</title>
    <link rel="stylesheet" href="style/wheel.css">
</head>

<body>
    <div class="wheel-container" style="text-align: center;">
        <h2>Spinning Wheel</h2>

        <!-- Wrapper added to establish relative positioning -->
        <div class="canvas-wrapper">
            <canvas id="wheelCanvas" width="1080" height="1080"></canvas>
            <button id="spinBtn" class="spin-center-btn">SPIN</button>
        </div>

    </div>

    <!-- Modal Popup -->
    <div id="winnerModal" class="modal">
        <div class="modal-content">
            <h2>🎉 The Winner is 🎉</h2>
            <p id="modalWinnerText"></p>
            <button id="closeModalBtn" class="btn-close">Close</button>
        </div>
    </div>

    <div id="dashboardModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
            <h2>🏆 Prize Winners Dashboard 🏆</h2>
            <div id="dashboardTableContainer" style="overflow-x: auto; max-height: 350px; margin: 15px 0;"></div>
            <button id="finishBtn" class="btn-submit">Finish</button>
        </div>
    </div>

    <script src="actions.js"></script>
</body>

</html>
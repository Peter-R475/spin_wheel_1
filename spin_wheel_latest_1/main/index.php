<?php
include("xlsx_process.php");
?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>XLSX Uploader</title>
    <link rel="stylesheet" href="style/index.css">
</head>

<body>
    <div class="file-container">
        <h2>Upload File</h2>
        <!-- Post directly to PHP to handle file writing on server disk -->
        <form method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="xlsxFile">Select XLSX File</label>
                <input type="file" name="xlsxFile" id="xlsxFile" accept=".xlsx" required>
            </div>
            <button type="submit" class="btn-submit">Upload File</button>
        </form>
    </div>
</body>

</html>
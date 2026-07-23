<?php
// Function to read XLSX directly in memory
function readXlsxDirectly($filePath)
{
    $zip = new ZipArchive();
    if ($zip->open($filePath) !== TRUE) {
        return false;
    }

    $sharedStrings = [];
    if (($index = $zip->locateName('xl/sharedStrings.xml')) !== false) {
        $xml = simplexml_load_string($zip->getFromIndex($index));
        foreach ($xml->si as $val) {
            $sharedStrings[] = (string) $val->t;
        }
    }

    $sheetXml = simplexml_load_string($zip->getFromName('xl/worksheets/sheet1.xml'));
    $zip->close();

    $rows = [];
    foreach ($sheetXml->sheetData->row as $row) {
        $rowData = [];
        foreach ($row->c as $cell) {
            $value = (string) $cell->v;
            if (isset($cell['t']) && (string) $cell['t'] === 's') {
                $value = $sharedStrings[(int) $value] ?? $value;
            }
            $rowData[] = $value;
        }
        $rows[] = $rowData;
    }

    if (empty($rows)) {
        return [];
    }

    $headers = array_shift($rows);
    $finalData = [];

    foreach ($rows as $row) {
        $item = [];
        foreach ($headers as $index => $key) {
            $item[$key] = $row[$index] ?? null;
        }
        $finalData[] = $item;
    }

    return $finalData;
}

// 1. Check if a file was uploaded via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['xlsxFile'])) {

    // Read directly from PHP's temporary file location in RAM
    $tmpFilePath = $_FILES['xlsxFile']['tmp_name'];
    $parsedData = readXlsxDirectly($tmpFilePath);

    if ($parsedData === false) {
        die("Error reading XLSX file.");
    }

    // 2. Output HTML & JS to store data in the browser, then redirect
    ?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Processing...</title>
    </head>

    <body>
        <p>Processing data, please wait...</p>
        <script>
            // Transfer parsed PHP array to JavaScript
            const excelData = <?php echo json_encode($parsedData); ?>;

            // Save inside client-side sessionStorage
            sessionStorage.setItem('wheel_data', JSON.stringify(excelData));

            // Redirect to your target page (e.g., spin wheel page)
            window.location.href = 'condition_selection.php';
        </script>
    </body>

    </html>
    <?php
    exit();
}
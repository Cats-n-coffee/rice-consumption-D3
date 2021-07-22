const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

// Converts Excel to Json
const result = excelToJson({
    source: fs.readFileSync('rice.xlsx'),
    columnToKey: {
        A: 'country',
        B: '2011',
        C: '2012',
        D: '2013',
        E: '2014',
        F: '2015'
    }
})

const data = new Uint8Array(Buffer.from(JSON.stringify(result)))

const newFile = fs.writeFileSync('rice2.json', data);

// Formats the Json to move all the years inside a data property
const readJson = fs.readFileSync('rice2.json', 'utf8');

const converted = JSON.parse(readJson);

for (let i = 0; i < converted.Worksheet.length; i += 1) {
    let entry = converted.Worksheet[i];

    let data = {};
    for (const key in entry) {
        if (key !== 'country') {
            data[key] = entry[key];
            delete entry[key];
        }
    }
    entry.data = data;
}

const formatted = new Uint8Array(Buffer.from(JSON.stringify(converted.Worksheet)))

const newJson = fs.writeFileSync('riceFormatted.json', formatted);
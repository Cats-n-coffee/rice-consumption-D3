const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

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

const newFile = fs.writeFileSync('rice.json', data);
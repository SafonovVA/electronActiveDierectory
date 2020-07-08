const fs = require('fs');
const excelHeaders = {
    sAMAccountName: 'username',
    displayName: 'display name'
};

const writeFile = async function writeFile(data, fileFormat, usersPath) {
    switch (fileFormat) {
        case 'txt':
            let text = '';
            data.forEach(user => {
                Object.keys(user).forEach(key => {
                    text += user[key] + '\t';
                });
                text += '\n';
            });

            fs.writeFile(usersPath, text, err => {
                if (err) {
                    throw err;
                }
                console.log('Success');
            });
            break;
        case 'json':
            fs.writeFile(usersPath, JSON.stringify(data, null, 4)
                .replace(/sAMAccountName/gim, 'username')
                .replace(/displayName/gim, 'display name'), err => {
                if (err) {
                    throw err;
                }
                console.log('Success');
            });
            break;
        case 'xlsx':
            try {
                const excel = require('exceljs');
                const workbook = new excel.Workbook();
                const sheet = workbook.addWorksheet('User get');

                const columns = [];
                for (let property in data[0]) {
                    if (data[0].hasOwnProperty(property)) {
                        columns.push({
                            header: excelHeaders[property] || property,
                            key: property,
                            width: 10
                        });
                    }
                }
                sheet.columns = columns;
                sheet.columns.forEach(column => {
                    column.width = column.header.length < 15 ? 15 : column.header.length;
                });
                //sheet.getRow(1).font = {
                //    bold: true
                //};

                for (let user of data) {
                    sheet.addRow(user);
                }

                for (let i = 1; i <= sheet.columns.length; i++) {
                    const cell = sheet.getRow(1).getCell(i);
                    cell.border = {
                        bottom: {style: 'double', color: {argb: '#020202'}}
                    };
                    cell.font = {
                        bold: true
                    };
                }

                await workbook.xlsx.writeFile(usersPath);
                console.log('Success');
            } catch (error) {
                switch (error.code) {
                    case 'EBUSY':
                        dialog.showErrorBox('Excel save error', 'File busy or locked');
                        break;
                    default:
                        console.log(JSON.stringify(error, null, 4) + '\n' + error.message);
                }
                console.log(JSON.stringify(error, null, 4));
            }
    }
}

module.exports = {writeFile};

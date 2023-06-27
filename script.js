// TypeScript object holding form control names
let signUpFormFields = {};

// Add event listener to the 'Add Row' button
const addRowButton = document.getElementById('addRowButton');
addRowButton.addEventListener('click', addRow);




function onpress(event) {
    if (event.key == 'Enter') {
        addRow();
    }
}
// Add event listeners to delete buttons
const deleteButtons = document.getElementsByClassName('delete-button');
Array.from(deleteButtons).forEach(button => button.addEventListener('click', deleteRow));

// Add event listeners to copy buttons
const copyButtons = document.querySelectorAll('.copy-button');
copyButtons.forEach(button => button.addEventListener('click', copyCode));

// Generate form input rows dynamically
function addRow() {
    const formTable = document.getElementById('formTable');
    const row = document.createElement('tr');

    const fieldNameCell = document.createElement('td');
    fieldNameCell.innerHTML = '<input type="text"  class="form-control field-name"  onkeypress="onpress(event)" onchange="generateCode()" placeholder="Field Name">';
    row.appendChild(fieldNameCell);

    const deleteCell = document.createElement('td');
    deleteCell.innerHTML = '<button class="btn btn-danger delete-button"><i class="bi bi-trash"></i></button></button>';
    deleteCell.firstChild.addEventListener('click', deleteRow);
    row.appendChild(deleteCell);

    formTable.querySelector('tbody').appendChild(row);

    var rows = formTable.querySelectorAll("tr");
    var lastRow = rows[rows.length - 1];
    var firstColumn = lastRow.querySelector("td");
    console.log(firstColumn.firstElementChild)
    firstColumn.firstElementChild.focus()
}

// Delete a form input row
function deleteRow(event) {
    const row = event.target.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// Generate the three outputs
function generateCode() {
    signUpFormFields = {};

    const formTable = document.getElementById('formTable');
    const formRows = formTable.querySelectorAll('tbody tr');
    let signUpFormFieldsString = '';
    let ngOnInitCode =
        `  
    public ${getFormName()}Form!: FormGroup;
    public ${getFormName()}FormFields = ${getFormName()}FormFields;

    constructor(
      private formBuilder: FormBuilder,
    ) { }

    ngOnInit() {
    this.${getFormName()}Form = this.formBuilder.group({\n`;

    const generatedTable = document.getElementById('generatedTable');
    generatedTable.querySelector('tbody').innerHTML = '';

    formRows.forEach((row, index) => {
        const fieldNameInput = row.querySelector('input');
        const fieldName = fieldNameInput.value.trim();

        if (fieldName === '') return; // Skip empty field names

        const camelCaseFieldName = fieldName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        const kebabCaseFieldName = camelToKebabCase(camelCaseFieldName);

        signUpFormFields[camelCaseFieldName] = kebabCaseFieldName;
        // signUpFormFieldsString += `  ${camelCaseFieldName}: '${kebabCaseFieldName}',\n`;
        signUpFormFieldsString += `  [${getFormName()}FormFields.${camelCaseFieldName}]: ['', [Validators.required]],',\n`;

        const rowCode = ` [formControlName]="${getFormName()}FormFields.${camelCaseFieldName}"`;

        const rowElement = document.createElement('tr');
        const fieldNameCell = document.createElement('td');
        fieldNameCell.textContent = kebabCaseFieldName;
        const codeCell = document.createElement('td');
        codeCell.textContent = rowCode;
        const copyButtonCell = document.createElement('td');
        copyButtonCell.innerHTML = `<button class="btn btn-secondary copy-button template-copy" data-clipboard-text='${rowCode}'>
      <i class="bi bi-clipboard-data"></i>
        </button>`;
        rowElement.appendChild(fieldNameCell);
        rowElement.appendChild(codeCell);
        rowElement.appendChild(copyButtonCell);
        generatedTable.querySelector('tbody').appendChild(rowElement);
    });

    ngOnInitCode += signUpFormFieldsString.trimEnd() + '\n});\n}';

    document.getElementById('codeContainer1').textContent = `export const ${getFormName()}FormFields = ${JSON.stringify(signUpFormFields, null, 2)};`;
    document.getElementById('codeContainer2').textContent = ngOnInitCode;

    // Initialize clipboard.js for copy buttons
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        const clipboard = new ClipboardJS(button);
        clipboard.on('success', e => {
            e.clearSelection();
            button.innerHTML = '<i class="bi bi-clipboard-data"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="bi bi-clipboard-data"></i>';
            }, 2000);
        });
        clipboard.on('error', e => {
            console.error('Copy failed', e);
        });
    });
}


// Get the form name
function getFormName() {
    const formName = document.getElementById('formNameInput').value.trim();
    return formName !== '' ? formName.replace(/ /g, '-') : '';
}

// Copy the code to the clipboard
function copyCode(event) {
    const target = event.target;
    const clipboard = new ClipboardJS(target, {
        target: function (trigger) {
            return trigger.getAttribute('data-clipboard-target');
        }
    });

    clipboard.on('success', function () {
        target.innerHTML = '<i class="bi bi-clipboard-data"></i> Copied!';
        setTimeout(function () {
            target.innerHTML = '<i class="bi bi-clipboard-data"></i>';
        }, 2000);
        clipboard.destroy();
    });

    clipboard.on('error', function () {
        console.error('Failed to copy to clipboard.');
        clipboard.destroy();
    });

    clipboard.onClick(event);
}

// Convert camel case to kebab case
function camelToKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

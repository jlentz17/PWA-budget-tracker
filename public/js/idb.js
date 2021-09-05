// create variable to hold db connection
let db;

// establish a connection to indexdb db called ""PWA-budget-tracker and set it to version 1
const request = indexedDB.open("PWA-budget-tracker", 1);

// this event will emit if the database version changes (nonexistent to version 1, v1 tpo v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called `new-transaction`, set it to have an auto-incrementing primary key of sorts
  db.createObjectStore("new-transaction", { autoIncrement: true });
};

// upon a succesful
request.onsuccess = function(event) {
    // when the db is succesfully created with its object store (from onupgradeneeded event above) or simply establish a connection, save reference to db in global variable
    const db = event.target.result
    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // we haven't created this yet so let's comment it out for now
        // uploadTransaction()
    }
}

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode)
}

// this function will be executed if we try to submit a new transaction and there is no internet connection
function saveRecord(record) {
    // open a new transcation with the db with read and write permissions
    const transaction = db.transaction(["new-transaction"], "readWrite")

    // access the object store for "new-transaction"
    const transactionObjectStore = transaction.objectStore("new-transaction")

    // add record to your store with add method
    transactionObjectStore.add(record)
}
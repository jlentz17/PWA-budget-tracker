// create variable to hold db connection
let db;

// establish a connection to indexdb db called ""PWA-budget-tracker and set it to version 1
const request = indexedDB.open("PWA_budget_tracker", 1);

// this event will emit if the database version changes (nonexistent to version 1, v1 tpo v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called `new-transaction`, set it to have an auto-incrementing primary key of sorts
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// upon a succesful
request.onsuccess = function(event) {
    // when the db is succesfully created with its object store (from onupgradeneeded event above) or simply establish a connection, save reference to db in global variable
    db = event.target.result
    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // we haven't created this yet so let's comment it out for now
        uploadTransaction()
    }
}

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode)
}

// this function will be executed if we try to submit a new transaction and there is no internet connection
function saveRecord(record) {
    // open a new transcation with the db with read and write permissions
    const transaction = db.transaction(["new_transaction"], "readwrite")

    // access the object store for "new-transaction"
    const transactionObjectStore = transaction.objectStore("new_transaction")

    // add record to your store with add method
    transactionObjectStore.add(record)
}

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(["new_transaction"], "readwrite")

    // access your object store
    const transactionObjectStore = transaction.objectStore("new_transaction")

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll()

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json" 
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                // open one more transaction
                const transaction = db.transaction(["new_transaction"], "readWrite")
                // access the new_transaction object store
                const transactionObjectStore = transaction.objectStore("new_transaction")
                // clear all items in your store
                transactionObjectStore.clear()

                alert("All saved transactions have been submitted")
            })
            .catch(err => {
                console.log(err)
                response.status(400).json(err)
            })
        }
    }
}

// listen for app coming back online
window.addEventListener("online", uploadTransaction)
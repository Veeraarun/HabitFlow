const DB_NAME = "habitflow";
const DB_VERSION = 5;
const HABITS_STORE = "habits";
const COMPLETIONS_STORE = "completions";
const REMINDERS_STORE = "reminders";
const SYNC_QUEUE_STORE = "sync_queue";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const transaction = event.target.transaction;

      if (!db.objectStoreNames.contains(HABITS_STORE)) {
        const store = db.createObjectStore(HABITS_STORE, {
          keyPath: "id",
        });

        store.createIndex("active", "active", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(COMPLETIONS_STORE)) {
        const store = db.createObjectStore(
          COMPLETIONS_STORE,
          {
            keyPath: "id",
          }
        );

        store.createIndex("habitId", "habitId", {
          unique: false,
        });

        store.createIndex("date", "date", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(REMINDERS_STORE)) {
        db.createObjectStore(REMINDERS_STORE, {
          keyPath: "key",
        });
      }

      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const store = db.createObjectStore(SYNC_QUEUE_STORE, {
          keyPath: "id",
        });

        store.createIndex("type", "type", {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }

      // Version 3 makes completion records the only completion source of truth.
      // Updating records in place preserves IDs and leaves the completions store
      // completely untouched. The migration is also safe for already-migrated data.
      if (event.oldVersion < 3 && db.objectStoreNames.contains(HABITS_STORE)) {
        const habitsStore = transaction.objectStore(HABITS_STORE);
        const cursorRequest = habitsStore.openCursor();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;

          const { completed, ...habit } = cursor.value;
          const migratedHabit = {
            ...habit,
            frequency: habit.frequency || { type: "daily" },
          };

          if (completed !== undefined || !habit.frequency) {
            cursor.update(migratedHabit);
          }

          cursor.continue();
        };
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getHabits(userId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      HABITS_STORE,
      "readonly"
    );

    const store = transaction.objectStore(HABITS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const habits = request.result;
      if (userId) {
        resolve(habits.filter((h) => h.userId === userId));
      } else {
        resolve(habits.filter((h) => !h.userId));
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveHabit(habit) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      HABITS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(HABITS_STORE);

    store.put(habit);

    transaction.oncomplete = () => {
      resolve(habit);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function deleteHabit(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [HABITS_STORE, COMPLETIONS_STORE, REMINDERS_STORE],
      "readwrite"
    );

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    const habitsStore = transaction.objectStore(HABITS_STORE);
    habitsStore.delete(id);

    const completionsStore = transaction.objectStore(COMPLETIONS_STORE);
    const completionsCursor = completionsStore
      .index("habitId")
      .openCursor(IDBKeyRange.only(id));

    completionsCursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    const remindersStore = transaction.objectStore(REMINDERS_STORE);
    const remindersCursor = remindersStore.openCursor();

    remindersCursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.habitId === id) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  });
}

export async function saveCompletion(completion) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      COMPLETIONS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(
      COMPLETIONS_STORE
    );

    store.put(completion);

    transaction.oncomplete = () => {
      resolve(completion);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getCompletions(userId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      COMPLETIONS_STORE,
      "readonly"
    );

    const store = transaction.objectStore(
      COMPLETIONS_STORE
    );

    const request = store.getAll();

    request.onsuccess = () => {
      const completions = request.result;
      if (userId) {
        resolve(completions.filter((c) => c.userId === userId));
      } else {
        resolve(completions.filter((c) => !c.userId));
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteCompletion(
  habitId,
  date
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      COMPLETIONS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(
      COMPLETIONS_STORE
    );

    const id = `${habitId}-${date}`;

    store.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getReminderRecords() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      REMINDERS_STORE,
      "readonly"
    );

    const store = transaction.objectStore(
      REMINDERS_STORE
    );

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveReminderRecord(record) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      REMINDERS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(
      REMINDERS_STORE
    );

    store.put(record);

    transaction.oncomplete = () => {
      resolve(record);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function addSyncOperation(operation) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    store.put(operation);

    transaction.oncomplete = () => {
      resolve(operation);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getSyncOperations() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readonly"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function removeSyncOperation(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    store.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function updateSyncOperation(id, updates) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;

      if (!existing) {
        reject(new Error(`Sync operation ${id} not found`));
        return;
      }

      const updated = { ...existing, ...updates };

      store.put(updated);

      transaction.oncomplete = () => {
        resolve(updated);
      };
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function clearSyncOperations(userId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    if (userId) {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.userId === userId) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } else {
      store.clear();
    }
  });
}

export async function getPendingOperationsForEntity(entityType, entityId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SYNC_QUEUE_STORE,
      "readonly"
    );

    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const operations = request.result;
      const pending = operations.filter(
        (op) =>
          op.entityType === entityType &&
          op.entityId === String(entityId)
      );
      resolve(pending);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveHabitFromCloud(habit) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      HABITS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(HABITS_STORE);

    store.put(habit);

    transaction.oncomplete = () => {
      resolve(habit);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function saveCompletionFromCloud(completion) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      COMPLETIONS_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(COMPLETIONS_STORE);

    store.put(completion);

    transaction.oncomplete = () => {
      resolve(completion);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function deleteHabitFromCloud(localId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [HABITS_STORE, COMPLETIONS_STORE],
      "readwrite"
    );

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    const habitsStore = transaction.objectStore(HABITS_STORE);
    habitsStore.delete(localId);

    const completionsStore = transaction.objectStore(COMPLETIONS_STORE);
    const completionsCursor = completionsStore
      .index("habitId")
      .openCursor(IDBKeyRange.only(localId));

    completionsCursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  });
}

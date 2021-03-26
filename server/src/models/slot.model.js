const db = require('../database');

/**
 * @class Slot
 */
class Slot {
  constructor(name, assistantName, bookedBy, status) {
    // Public data
    this.name = name;
    this.assistant_name = assistantName;
    this.booked_by = bookedBy;
    this.status = status;

    // Private data
    this.reservationID = null;
    this.reservationTimeout = null;
  }

  reserveSlot(reservationID) {
    this.reservationID = reservationID;
    this.status = 'reserved';
  }

  bookSlot(bookedBy) {
    clearTimeout(this.reservationTimeout);
    this.reservationTimeout = null;
    this.reservationID = null;
    this.status = 'booked';
    this.booked_by = bookedBy;

    db.get('UPDATE timeslots SET booked_by = (?) WHERE name = (?)', bookedBy, this.name, (err) => {
      if (err) console.log(err.message);
    });
  }

  freeSlot() {
    console.log('Freeing slot!');
    clearTimeout(this.reservationTimeout);
    this.reservationTimeout = null;
    this.reservationID = null;
    this.booked_by = '';
    this.status = 'available';
  }

  setReservationTimeout(reservationTimeout) {
    this.reservationTimeout = reservationTimeout;
  }

  getPublicData() {
    const publicData = {
      name: this.name,
      booked_by: this.booked_by,
      assistant_name: this.assistant_name,
      status: this.status,
    };

    return publicData;
  }
}

module.exports = Slot;

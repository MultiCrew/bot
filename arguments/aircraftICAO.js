const { Argument } = require("klasa");
const regex = /[A-Z]{1,}[0-9]{1,}[A-Z]?/;

module.exports = class extends Argument {
  run(arg, possible, message) {
    if(arg){
      const result = regex.exec(arg);
      if (result) return arg.toUpperCase();
      throw message.language.get('INVALID_ICAO_CODE', arg);
    }
  }
};

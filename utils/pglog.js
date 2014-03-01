/*
*
* @class PGLog
*
* This file defines the PGLog class.
*
*/

var _defaultLevel = "warn";
var _levelMap = {
    fatal: 100,
    error:  50,
    warn:   30,
    info:   20,
    debug:  10,
    verbose: 0
};

function PGLog(moduleName, level) {
    this._moduleName = moduleName;
    this._level = _levelMap[level || _defaultLevel];
}

PGLog.prototype._log = function(str, level) {
    if (_levelMap[level] >= this._level)
        console.log('[' + "             ".slice(0, 10-this._moduleName.length) + this._moduleName + '] ' + str);
};

PGLog.prototype.fatal   = function(str) { this._log("[FATAL  ] " + str, "fatal"  ); };
PGLog.prototype.error   = function(str) { this._log("[ERROR  ] " + str, "error"  ); };
PGLog.prototype.warn    = function(str) { this._log("[WARN   ] " + str, "warn"   ); };
PGLog.prototype.info    = function(str) { this._log("[INFO   ] " + str, "info"   ); };
PGLog.prototype.debug   = function(str) { this._log("[DEBUG  ] " + str, "debug"  ); };
PGLog.prototype.verbose = function(str) { this._log("[DEBUG  ] " + str, "verbose"); };

module.exports = PGLog;

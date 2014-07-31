var fs = require('fs');
var election = {
    Office: function(name) {
        this.name = name;
        this.results = {};
        this.announce_winner = function() {
            var winner;
            var max = 0;
            for (var i in this.results) {
                if (this.results[i].votes > max) {
                    max = this.results[i].votes;
                    winner = this.results[i];
                    winner.party = i;
                }
            }
            var announcement = 'Winner of ' + this.name + ' with ' + winner.votes + ' votes: ' + winner.candidate + ' -- ' + winner.party;
            announcement = announcement.replace(/\s+/g, ' ');
            console.log(announcement);
        };
        return this;
    },
    offices: [],
    report: function() {
        for (var i in this.offices) {
            this.offices[i].announce_winner();
        }
    },
    parse: function(data) {
        var votes = data.toString().split(new RegExp('\r?\n', 'g'));
        for (var i in votes) {
            var vote = votes[i].split("\t");
            var office_name = vote[3];
            var party = vote[5];
            var candidate = vote[4];
            if (party === '') {
                party = candidate;
            }
            var office = election.offices.filter(function(off) {
                return off.name == office_name;
            });
            if (office.length) {
                office = office[0];
                if (office.results.hasOwnProperty(party)) {
                    office.results[party].votes += parseInt(vote[6]);
                } else {
                    office.results[party] = {
                        'votes': parseInt(vote[6]),
                        'candidate': candidate
                    };
                }
            } else {
                if (typeof office_name !== 'string' || office_name !== office_name.toUpperCase() || office_name === 'OFFICE') {
                    continue;
                }
                office = new election.Office(office_name);
                office.results[party] = {
                    'votes': parseInt(vote[6]),
                    'candidate': candidate
                };
                election.offices.push(office);
            }
        }
        //console.log(JSON.stringify(election.offices, null, 4));
    },
    init: function() {
        fs.readFile('./2012_GENERAL.txt', 'utf8', function(err, data) {
            // the data is passed to the callback in the second argument
            election.parse(data);
            election.report();
        });
    }
};
election.init();
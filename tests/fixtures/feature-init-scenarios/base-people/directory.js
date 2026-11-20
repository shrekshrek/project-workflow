const people = [
  { personId: "p1", employeeId: null, name: "Alex", job: "摄影", location: "上海", email: null },
  { personId: "p2", employeeId: null, name: "Alex", job: "剪辑", location: "北京", email: null },
  { personId: "p3", employeeId: "e3", name: "Lin", job: "策划", location: "上海", email: "lin@example.test" },
];

function directoryRows() {
  return people.map(person => ({ key: person.personId, title: person.name }));
}

module.exports = { directoryRows };

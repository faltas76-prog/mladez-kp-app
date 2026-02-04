const defaultDrills = [
  {
    id: 1,
    name: "Aktivace s míčem",
    goals: ["technika"],
    duration: 10,
    description: "Lehké vedení míče.",
    link: "https://www.youtube.com/results?search_query=football+warm+up+with+ball"
  },
  {
    id: 2,
    name: "Sprinty 10–20 m",
    goals: ["rychlost"],
    duration: 10,
    description: "Maximální akcelerace.",
    link: "https://www.youtube.com/results?search_query=football+sprint+drill"
  },
  {
    id: 3,
    name: "Malá hra 5v5",
    goals: ["hra"],
    duration: 20,
    description: "Vysoké tempo.",
    link: "https://www.youtube.com/results?search_query=5v5+small+sided+game+football"
  }
];

function getAllDrills() {
  const custom = JSON.parse(localStorage.getItem("customDrills")) || [];
  return [...defaultDrills, ...custom];
}

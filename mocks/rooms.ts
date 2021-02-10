export type Room = {
  name: string;
  id: number;
};

const staticRooms: Room[] = [
  {
    name: "Sala Skywalker",
    id: 1,
  },
  { name: "Sala Palpatine", id: 2 },
];

export { staticRooms };

import { useRouter } from "next/router";
import styled from "styled-components";

import { staticRooms } from "../mocks/rooms";

const Title = styled.h1`
  font-size: 5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Home = () => {
  const router = useRouter();

  const joinRoom = (roomId: number) => router.push(`rooms/${roomId}`);

  return (
    <>
      <Title>Selecciona una de las salas disponibles: </Title>
      {staticRooms.map((room) => (
        <li key={room.id} onClick={() => joinRoom(room.id)}>
          {room.name}
        </li>
      ))}
    </>
  );
};

export default Home;

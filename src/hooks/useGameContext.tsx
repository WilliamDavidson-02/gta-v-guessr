import { GameContext } from "@/context/GameContext";
import { useContext } from "react";

export default function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { initialize, LDClient } from 'launchdarkly-js-client-sdk';

interface PokemonData {
    name: string;
    id: number;
    types: { type: { name: string } }[];
    sprites: { front_default: string };
  }


export function usePokemonData() {
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ldClient, setLdClient] = useState<LDClient | null>(null);
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);



// Initialize Launch Darkly

useEffect(() => {
    const initLaunchDarkly = async () => {
      const clientSideId = process.env.NEXT_PUBLIC_LD_CLIENT_SIDE_SDK;
      console.log('LaunchDarkly Client Side ID:', clientSideId);
      if (!clientSideId) {
        console.error('LaunchDarkly client-side ID is not set');
        return;
      }
      try {
        const client = initialize(clientSideId, { anonymous: true });
        await client.waitForInitialization();
        console.log('LaunchDarkly client initialized successfully');
        setLdClient(client);
        const quizModeValue = client.variation('quiz-mode', false);
        console.log('Quiz mode value:', quizModeValue);
        setIsQuizMode(quizModeValue);
      } catch (error) {
        console.error('Error initializing LaunchDarkly:', error);
        setIsQuizMode(false);
      }
    };

    initLaunchDarkly();
  }, []);


// funtion feteches a random pokemon but of the correct type. 

const fetchNewPokemon = useCallback(async () => {
    const allowedTypes = ['grass', 'water', 'fire'];
    try {
      setIsLoading(true);
      let newPokemon: PokemonData;
      do {
        const randomId = Math.floor(Math.random() * 898) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        newPokemon = await response.json();
      } while (isQuizMode && !newPokemon.types.some(type => allowedTypes.includes(type.type.name)));
      setPokemon(newPokemon);
    } catch (e) {
      console.error('Error fetching Pokemon:', e);
      setError('Failed to fetch Pokemon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isQuizMode]);

// fetch new pokemon when QuizMode changes

  useEffect(() => {
    fetchNewPokemon();
  }, [isQuizMode, fetchNewPokemon]);
  
// build logic for guessing pokemon types in quiz mode  

  const handleTypeGuess = (guessedType: string) => {
    if (!pokemon || gameOver) return;
  
    const correctTypes = pokemon.types.map(type => type.type.name);
    if (correctTypes.includes(guessedType)) {
      setScore(prevScore => prevScore + 1);
      fetchNewPokemon();
    } else {
      setAttempts(prevAttempts => prevAttempts + 1);
      if (attempts >= 2) {
        setGameOver(true);
      }
    }
  };

// reset game funtion 

  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    fetchNewPokemon();
  };

  return {
    pokemon,
    isLoading,
    error,
    isQuizMode,
    score,
    attempts,
    gameOver,
    fetchNewPokemon,
    handleTypeGuess,
    resetGame
  };
}


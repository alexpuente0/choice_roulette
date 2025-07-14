import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { db, optionsCollection } from '../firebase';

const OptionsContext = createContext();

export const OptionsProvider = ({ children }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listener for options
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onSnapshot(
      optionsCollection,
      (snapshot) => {
        const optionsData = [];
        snapshot.forEach((doc) => {
          optionsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setOptions(optionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching options:", error);
        setError("Failed to load options. Please try again later.");
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const addOption = async (name) => {
    if (!name.trim()) return false;
    
    // Check if option already exists (case insensitive)
    const exists = options.some(
      option => option.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (exists) return false;

    try {
      await addDoc(optionsCollection, {
        name: name.trim(),
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Error adding option:", error);
      setError("Failed to add option. Please try again.");
      return false;
    }
  };

  const removeOption = async (id) => {
    try {
      await deleteDoc(doc(db, 'rouletteOptions', id));
    } catch (error) {
      console.error("Error removing option:", error);
      setError("Failed to remove option. Please try again.");
    }
  };

  const clearOptions = async () => {
    try {
      const batch = writeBatch(db);
      const optionsSnapshot = await getDocs(optionsCollection);
      
      optionsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error clearing options:", error);
      setError("Failed to clear options. Please try again.");
    }
  };

  return (
    <OptionsContext.Provider 
      value={{ 
        options, // Now providing full option objects with id and text
        addOption, 
        removeOption, 
        clearOptions,
        loading,
        error
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
};

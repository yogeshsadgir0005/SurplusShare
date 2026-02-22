import { useState, useEffect } from 'react';
import axios from 'axios';

export const useLocationAPI = (selectedState) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Open-source JSON containing all precise Indian States and Districts
    axios.get('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json')
      .then(res => {
        setStates(res.data.states);
        if (selectedState) {
          const stateObj = res.data.states.find(s => s.state === selectedState);
          setDistricts(stateObj ? stateObj.districts : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Location API Error:", err);
        setLoading(false);
      });
  }, [selectedState]);

  return { states, districts, loading };
};
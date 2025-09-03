import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Teacherterms = () => {
  const [terms, setTerms] = useState([]);
  const [params] = useSearchParams();
  const id = params.get('id');
    const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from the API
    axios.get(`/api/course/terms/${id}`)
      .then(response => {
        setTerms(response.data); // Assuming the response is an array of term objects
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, [id]); // Add `id` as a dependency to re-fetch data if the ID changes

  // Rainbow colors for the cards
  const colors = [
    'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 
    'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400'
  ];

  return (
    <div className="p-8 pt-32 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 justify-center text-center">Course Terms</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {terms.map((term, index) => (
          <div
            key={term._id} // Use the `_id` as the key
            className={`p-6 rounded-lg cursor-pointer shadow-lg text-white text-center ${colors[index % colors.length]}`}
            onClick={() => {navigate(`/teacher/level/term?levelid=${id}&termid=${term._id}`)}}
          >
            <h2 className="text-2xl font-semibold">{term.name}</h2> {/* Display the `name` property */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teacherterms;
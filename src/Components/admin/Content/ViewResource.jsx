import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Loader from '../../Loader';

const ViewResource = () => {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(`api/content/getdata/${resourceId}`);
        setResource(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <iframe
      title="View Page"
      srcDoc={resource.content}
      sandbox="allow-scripts allow-same-origin"
      className="w-screen h-screen border-none"
    />
  );
};

export default ViewResource;
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const AddLevelPage = () => {
    const [levelName, setLevelName] = useState("");
    const [terms, setTerms] = useState([
        {
            termName: "",
            topics: [
                {
                    topicName: "",
                    contents: [
                        {
                            contentPDF: "",
                            contentVideo: "",
                            keynotePDF: "",
                            project: "",
                        },
                    ],
                },
            ],
        },
    ]);
   

    // Add a new term
    const handleAddTerm = () => {
        setTerms([
            ...terms,
            {
                termName: "",
                topics: [
                    {
                        topicName: "",
                        contents: [
                            {
                                contentPDF: "",
                                contentVideo: "",
                                keynotePDF: "",
                            },
                        ],
                    },
                ],
            },
        ]);
    };

    // Delete a term
    const handleDeleteTerm = (termIndex) => {
        const updatedTerms = terms.filter((_, index) => index !== termIndex);
        setTerms(updatedTerms);
    };

    // Add a new topic to a term
    const handleAddTopic = (termIndex) => {
        const updatedTerms = [...terms];
        updatedTerms[termIndex].topics.push({
            topicName: "",
            contents: [
                {
                    contentPDF: "",
                    contentVideo: "",
                    keynotePDF: "",
                    project: "",
                },
            ],
        });
        setTerms(updatedTerms);
    };

    // Delete a topic from a term
    const handleDeleteTopic = (termIndex, topicIndex) => {
        const updatedTerms = [...terms];
        updatedTerms[termIndex].topics = updatedTerms[termIndex].topics.filter(
            (_, index) => index !== topicIndex
        );
        setTerms(updatedTerms);
    };

    // Add a new content to a topic
    const handleAddContent = (termIndex, topicIndex) => {
        const updatedTerms = [...terms];
        updatedTerms[termIndex].topics[topicIndex].contents.push({
            contentPDF: "",
            contentVideo: "",
            keynotePDF: "",
            project: "",
        });
        setTerms(updatedTerms);
    };

    // Delete a content from a topic
    const handleDeleteContent = (termIndex, topicIndex, contentIndex) => {
        const updatedTerms = [...terms];
        updatedTerms[termIndex].topics[topicIndex].contents = updatedTerms[termIndex].topics[
            topicIndex
        ].contents.filter((_, index) => index !== contentIndex);
        setTerms(updatedTerms);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const levelData = {
            levelName,
            terms,
        };

        try {
            const response = await axios.post('/api/course/add', levelData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                toast.success('Level added successfully!');
                // Reset form
                setLevelName('');
                setTerms([
                    {
                        termName: '',
                        topics: [
                            {
                                topicName: '',
                                contents: [
                                    {
                                        contentPDF: '',
                                        contentVideo: '',
                                        keynotePDF: '',
                                        project: '',
                                    },
                                ],
                            },
                        ],
                    },
                ]);
                
            } else {
                toast.error(`${response.data.message}`);
            }
        } catch (error) {
            toast.error(`${error.response ? error.response.data.message : error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 pt-32">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Add New Level</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Level Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Level Name</label>
                        <input
                            type="text"
                            value={levelName}
                            onChange={(e) => setLevelName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    
                    {/* Terms Section */}
                    <div className="space-y-4">
                        {terms.map((term, termIndex) => (
                            <div key={termIndex} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Term {termIndex + 1}</h2>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTerm(termIndex)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete Term
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Term Name</label>
                                    <input
                                        type="text"
                                        value={term.termName}
                                        onChange={(e) => {
                                            const updatedTerms = [...terms];
                                            updatedTerms[termIndex].termName = e.target.value;
                                            setTerms(updatedTerms);
                                        }}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Topics Section */}
                                <div className="mt-4 space-y-4">
                                    {term.topics.map((topic, topicIndex) => (
                                        <div key={topicIndex} className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">Topic {topicIndex + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTopic(termIndex, topicIndex)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Delete Topic
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Topic Name</label>
                                                <input
                                                    type="text"
                                                    value={topic.topicName}
                                                    onChange={(e) => {
                                                        const updatedTerms = [...terms];
                                                        updatedTerms[termIndex].topics[topicIndex].topicName = e.target.value;
                                                        setTerms(updatedTerms);
                                                    }}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                            </div>

                                            {/* Contents Section */}
                                            <div className="mt-4 space-y-4">
                                                {topic.contents.map((content, contentIndex) => (
                                                    <div key={contentIndex} className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="text-md font-semibold text-gray-800">Content {contentIndex + 1}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteContent(termIndex, topicIndex, contentIndex)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Delete Content
                                                            </button>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Content PDF URL</label>
                                                            <input
                                                                type="text"
                                                                value={content.contentPDF}
                                                                onChange={(e) => {
                                                                    const updatedTerms = [...terms];
                                                                    updatedTerms[termIndex].topics[topicIndex].contents[contentIndex].contentPDF = e.target.value;
                                                                    setTerms(updatedTerms);
                                                                }}
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="mt-2">
                                                            <label className="block text-sm font-medium text-gray-700">Content Video URL</label>
                                                            <input
                                                                type="text"
                                                                value={content.contentVideo}
                                                                onChange={(e) => {
                                                                    const updatedTerms = [...terms];
                                                                    updatedTerms[termIndex].topics[topicIndex].contents[contentIndex].contentVideo = e.target.value;
                                                                    setTerms(updatedTerms);
                                                                }}
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="mt-2">
                                                            <label className="block text-sm font-medium text-gray-700">Keynote PDF URL</label>
                                                            <input
                                                                type="text"
                                                                value={content.keynotePDF}
                                                                onChange={(e) => {
                                                                    const updatedTerms = [...terms];
                                                                    updatedTerms[termIndex].topics[topicIndex].contents[contentIndex].keynotePDF = e.target.value;
                                                                    setTerms(updatedTerms);
                                                                }}
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="mt-2">
                                                            <label className="block text-sm font-medium text-gray-700">Project URL</label>
                                                            <input
                                                                type="text"
                                                                value={content.project}
                                                                onChange={(e) => {
                                                                    const updatedTerms = [...terms];
                                                                    updatedTerms[termIndex].topics[topicIndex].contents[contentIndex].project = e.target.value;
                                                                    setTerms(updatedTerms);
                                                                }}
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddContent(termIndex, topicIndex)}
                                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Add Content
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddTopic(termIndex)}
                                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Topic
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddTerm}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Term
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Save Level
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLevelPage;
'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '@/utils/pocketbase';
import { TEST_COLLECTION } from '@/utils/constants';
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const AddTask = () => {
    const [tasks, setTasks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const { handleSubmit, register, reset } = useForm();

    const fetchTasks = async () => {
        try {
            const records = await client.collection(TEST_COLLECTION).getFullList({ sort: '-created' });
            setTasks(records);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const submitHandler = async (data) => {
        try {
            await client.collection(TEST_COLLECTION).create(data);
            reset();
            await fetchTasks();
            alert('Task added successfully');
        } catch (err) {
            console.error('Error adding task:', err.response || err);
            alert('Failed to add task');
        }
    };

    const handleDelete = async (id) => {
        try {
            await client.collection(TEST_COLLECTION).delete(id);
            setTasks(prev => prev.filter(task => task.id !== id));
        } catch (err) {
            console.error('Error deleting task:', err.response || err);
            alert('Failed to delete task');
        }
    };

    const handleEdit = (id, currentText) => {
        setEditingId(id);
        setEditedText(currentText);
    };

    const handleUpdate = async (id) => {
        try {
            await client.collection(TEST_COLLECTION).update(id, { task: editedText });
            setEditingId(null);
            setEditedText('');
            await fetchTasks();
        } catch (err) {
            console.error('Error updating task:', err.response || err);
            alert('Failed to update task');
        }
    };

    return (
        <div className="mt-50 justify-center mx-auto">
            <h1 className="text-2xl text-white font-bold mt-20 mb-4 justify-center"> TODOs List </h1>

            <form onSubmit={handleSubmit(submitHandler)} className="mb-4">
                <input
                    type="text"
                    {...register('task', { required: true })}
                    placeholder="Enter a new task"
                    className="border border-white text-white px-4 py-2 rounded-2xl w-full mb-2"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Add New Task
                </button>
            </form>

            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-2">All Tasks</h2>
                {tasks.length === 0 ? (
                    <p>No records found.</p>
                ) : (
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th>#</th>
                                <th>Task</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((rec, index) => (
                                <tr key={rec.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {editingId === rec.id ? (
                                            <input
                                                type="text"
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                className="border px-2 py-1 rounded"
                                            />
                                        ) : (
                                            rec.task
                                        )}
                                    </td>
                                    <td>{new Date(rec.created).toLocaleString()}</td>
                                    <td className="flex gap-2">
                                        {editingId === rec.id ? (
                                            <button
                                                onClick={() => handleUpdate(rec.id)}
                                                className="bg-green-500 text-white px-2 py-1 rounded"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(rec.id, rec.task)}
                                                className="px-2 py-1 rounded"
                                            >
                                                <CiEdit size={25} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(rec.id)}
                                            className="px-2 py-1 rounded"
                                        >
                                            <MdDelete size={25} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AddTask;


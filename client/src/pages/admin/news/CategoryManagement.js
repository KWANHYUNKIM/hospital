import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNewsCategories, createCategory, updateCategory, deleteCategory } from '../../../service/newsApi';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getNewsCategories();
      setCategories(response);
      setLoading(false);
    } catch (err) {
      setError('카테고리를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await createCategory(newCategory);
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError('카테고리 생성에 실패했습니다.');
    }
  };

  const handleUpdateCategory = async (id, name) => {
    try {
      await updateCategory(id, name);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError('카테고리 수정에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError('카테고리 삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">카테고리 관리</h1>
        <button
          onClick={() => navigate('/admin/news')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          뉴스 관리로 돌아가기
        </button>
      </div>

      {/* 새 카테고리 생성 폼 */}
      <form onSubmit={handleCreateCategory} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            추가
          </button>
        </div>
      </form>

      {/* 카테고리 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      onBlur={(e) => handleUpdateCategory(category.id, e.target.value)}
                      className="px-2 py-1 border rounded"
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{category.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingCategory(category.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
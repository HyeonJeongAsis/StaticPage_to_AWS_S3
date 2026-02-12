import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // 초기 데이터 (localStorage에 데이터가 없으면 기본값 사용)
  const initialBooks = JSON.parse(localStorage.getItem('library-books')) || [
    { id: 1, title: '리액트 다루기', author: 'Velopert', isBorrowed: false },
    { id: 2, title: '모던 자바스크립트', author: '이웅모', isBorrowed: true },
  ];

  const [books, setBooks] = useState(initialBooks);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  // books 상태가 변할 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('library-books', JSON.stringify(books));
  }, [books]);

  // 도서 추가 함수
  const handleAddBook = (e) => {
    e.preventDefault();
    if (!title || !author) return alert('제목과 저자를 모두 입력해주세요.');

    const newBook = {
      id: Date.now(), // 고유 ID 생성
      title,
      author,
      isBorrowed: false,
    };

    setBooks([...books, newBook]);
    setTitle('');
    setAuthor('');
  };

  // 도서 삭제 함수
  const handleDeleteBook = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  // 대출/반납 토글 함수
  const toggleBorrowStatus = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, isBorrowed: !book.isBorrowed } : book
      )
    );
  };

  return (
    <div className="container">
      <header className="header">
        <h1>📚 도서 관리 시스템</h1>
      </header>

      <div className="content">
        {/* 왼쪽: 도서 등록 폼 */}
        <section className="form-section">
          <h2>새 도서 등록</h2>
          <form onSubmit={handleAddBook}>
            <div className="input-group">
              <label>도서 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 클린 코드"
              />
            </div>
            <div className="input-group">
              <label>저자</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 로버트 C. 마틴"
              />
            </div>
            <button type="submit" className="add-btn">등록하기</button>
          </form>
        </section>

        {/* 오른쪽: 도서 목록 리스트 */}
        <section className="list-section">
          <h2>도서 목록 ({books.length}권)</h2>
          {books.length === 0 ? (
            <p className="empty-msg">등록된 도서가 없습니다.</p>
          ) : (
            <ul className="book-list">
              {books.map((book) => (
                <li key={book.id} className={`book-item ${book.isBorrowed ? 'borrowed' : ''}`}>
                  <div className="book-info">
                    <span className="book-title">{book.title}</span>
                    <span className="book-author">{book.author}</span>
                  </div>
                  <div className="book-actions">
                    <button
                      className={`status-btn ${book.isBorrowed ? 'return' : 'rent'}`}
                      onClick={() => toggleBorrowStatus(book.id)}
                    >
                      {book.isBorrowed ? '반납하기' : '대출하기'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
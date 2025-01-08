// src/components/NewsSection.js
import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import axios from 'axios';
import './NewsSection.css';
import NewsCarousel from './NewsCarousel';

const NewsSection = () => {
  const { theme } = useContext(ThemeContext);
  const [newsArticles, setNewsArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      console.log('Fetching news...')
      const apiKey = process.env.REACT_APP_NEWSAPI_KEY;
      const query = 'pokemon';
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;

      try {
        const response = await axios.get(url);
        console.log('News response:', response);
        setNewsArticles(response.data.articles);
      } catch (error) {
        console.error('Error fetching news articles:', error);
        setError('Failed to load news articles.');
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="mt-5 news-section">
      <h2>Latest News</h2>
      {error && <p className="text-danger">{error}</p>}
      {newsArticles.length > 0 ? (
        <NewsCarousel newsArticles={newsArticles.slice(0, 12)} theme={theme} />
      ) : !error ? (
        <p>Loading news articles...</p>
      ) : null}
    </section>
  );
};

export default NewsSection;

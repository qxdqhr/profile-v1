'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Book, Eye } from 'lucide-react';
import styles from './ShowMasterPieces.module.css';

// 模拟画集数据
const mockArtCollections = [
  {
    id: 1,
    title: '印象派经典',
    artist: '莫奈等',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/800px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
    description: '法国印象派大师作品精选',
    pages: [
      { 
        id: 1, 
        title: '睡莲', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1919%2C_Metropolitan_Museum_of_Art.jpg/1200px-Claude_Monet_-_Water_Lilies_-_1919%2C_Metropolitan_Museum_of_Art.jpg', 
        artist: '克劳德·莫奈' 
      },
      { 
        id: 2, 
        title: '日出·印象', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1200px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg', 
        artist: '克劳德·莫奈' 
      },
      { 
        id: 3, 
        title: '草垛', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Claude_Monet_-_Haystacks_%28Effect_of_Snow_and_Sun%29_-_Google_Art_Project.jpg/1200px-Claude_Monet_-_Haystacks_%28Effect_of_Snow_and_Sun%29_-_Google_Art_Project.jpg', 
        artist: '克劳德·莫奈' 
      },
      { 
        id: 4, 
        title: '舞蹈课', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg/1200px-Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg', 
        artist: '埃德加·德加' 
      },
    ]
  },
  {
    id: 2,
    title: '现代抽象艺术',
    artist: '毕加索等',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Les_Demoiselles_d%27Avignon.jpg/800px-Les_Demoiselles_d%27Avignon.jpg',
    description: '20世纪现代艺术巨匠作品',
    pages: [
      { 
        id: 1, 
        title: '亚威农少女', 
        image: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Les_Demoiselles_d%27Avignon.jpg/1200px-Les_Demoiselles_d%27Avignon.jpg', 
        artist: '巴勃罗·毕加索' 
      },
      { 
        id: 2, 
        title: '格尔尼卡', 
        image: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/PicassoGuernica.jpg/1200px-PicassoGuernica.jpg', 
        artist: '巴勃罗·毕加索' 
      },
      { 
        id: 3, 
        title: '星月夜', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', 
        artist: '文森特·梵高' 
      },
    ]
  },
  {
    id: 3,
    title: '中国传统山水',
    artist: '张大千等',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Wang_Ximeng._A_Thousand_Li_of_Rivers_and_Mountains._%28Complete%29.jpg/800px-Wang_Ximeng._A_Thousand_Li_of_Rivers_and_Mountains._%28Complete%29.jpg',
    description: '中国传统山水画精品集',
    pages: [
      { 
        id: 1, 
        title: '千里江山图', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Wang_Ximeng._A_Thousand_Li_of_Rivers_and_Mountains._%28Complete%29.jpg/1200px-Wang_Ximeng._A_Thousand_Li_of_Rivers_and_Mountains._%28Complete%29.jpg', 
        artist: '王希孟' 
      },
      { 
        id: 2, 
        title: '富春山居图', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Dwelling_in_the_Fuchun_Mountains_%28first_half%29.jpg/1200px-Dwelling_in_the_Fuchun_Mountains_%28first_half%29.jpg', 
        artist: '黄公望' 
      },
      { 
        id: 3, 
        title: '清明上河图', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Zhang_Zeduan._Qingming_Shang_He_Tu_%28Spring_Festival_On_the_River%29._%28Complete%29.jpg/1200px-Zhang_Zeduan._Qingming_Shang_He_Tu_%28Spring_Festival_On_the_River%29._%28Complete%29.jpg', 
        artist: '张择端' 
      },
      { 
        id: 4, 
        title: '泼墨山水', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Zhang_Daqian_Self-Portrait.jpg/800px-Zhang_Daqian_Self-Portrait.jpg', 
        artist: '张大千' 
      },
      { 
        id: 5, 
        title: '寒江独钓图', 
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Ma_Yuan_-_Dancing_and_Singing-_Peasants_Returning_from_Work_-_Google_Art_Project.jpg/1200px-Ma_Yuan_-_Dancing_and_Singing-_Peasants_Returning_from_Work_-_Google_Art_Project.jpg', 
        artist: '马远' 
      },
    ]
  }
];

export default function ShowMasterPieces() {
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleCollectionSelect = (collection: any) => {
    setSelectedCollection(collection);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (selectedCollection && currentPage < selectedCollection.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBackToGallery = () => {
    setSelectedCollection(null);
    setCurrentPage(0);
  };

  if (selectedCollection) {
    const currentArtwork = selectedCollection.pages[currentPage];
    
    return (
      <div className={styles.container}>
        {/* 顶部导航 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerNav}>
              <button
                onClick={handleBackToGallery}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
                <span>返回画集库</span>
              </button>
              <div className={styles.headerTitle}>
                <h1>{selectedCollection.title}</h1>
                <p>作者：{selectedCollection.artist}</p>
              </div>
              <div className={styles.pageInfo}>
                第 {currentPage + 1} 页 / 共 {selectedCollection.pages.length} 页
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className={styles.mainContent}>
          <div className={styles.contentGrid}>
            {/* 作品展示区 */}
            <div className={styles.artworkSection}>
              <div className={styles.artworkCard}>
                <div className={styles.artworkImageContainer}>
                  <img
                    src={currentArtwork.image}
                    alt={currentArtwork.title}
                    className={styles.artworkImage}
                  />
                  
                  {/* 翻页按钮 */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`${styles.navButton} ${styles.prevButton}`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === selectedCollection.pages.length - 1}
                    className={`${styles.navButton} ${styles.nextButton}`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
                
                {/* 作品信息 */}
                <div className={styles.artworkInfo}>
                  <h2 className={styles.artworkTitle}>{currentArtwork.title}</h2>
                  <p className={styles.artworkArtist}>创作者：{currentArtwork.artist}</p>
                </div>
              </div>
            </div>

            {/* 侧边栏 - 页面缩略图 */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>画集目录</h3>
                <div className={styles.thumbnailList}>
                  {selectedCollection.pages.map((page: any, index: number) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`${styles.thumbnailItem} ${
                        index === currentPage ? styles.active : ''
                      }`}
                    >
                      <div className={styles.thumbnailContent}>
                        <img
                          src={page.image}
                          alt={page.title}
                          className={styles.thumbnailImage}
                        />
                        <div className={styles.thumbnailInfo}>
                          <div className={styles.thumbnailTitle}>
                            {page.title}
                          </div>
                          <div className={styles.thumbnailPage}>
                            第 {index + 1} 页
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 页面标题 */}
      <div className={styles.mainHeader}>
        <div className={styles.mainHeaderContent}>
          <h1 className={styles.mainTitle}>艺术画集展览馆</h1>
          <p className={styles.mainDescription}>
            精选世界各地艺术大师的经典作品，每一页都是一次艺术的沉浸体验
          </p>
        </div>
      </div>

      {/* 画集网格 */}
      <div className={styles.galleryContent}>
        <div className={styles.galleryGrid}>
          {mockArtCollections.map((collection) => (
            <div
              key={collection.id}
              className={styles.collectionCard}
            >
              <div className={styles.collectionImageContainer}>
                <img
                  src={collection.coverImage}
                  alt={collection.title}
                  className={styles.collectionCover}
                />
                <div className={styles.collectionOverlay} />
                <div className={styles.collectionBadge}>
                  <div className={styles.collectionBadgeContent}>
                    <Book size={16} />
                    <span className={styles.collectionBadgeText}>共 {collection.pages.length} 页</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.collectionContent}>
                <h3 className={styles.collectionTitle}>{collection.title}</h3>
                <p className={styles.collectionArtist}>作者：{collection.artist}</p>
                <p className={styles.collectionDescription}>{collection.description}</p>
                
                <button
                  onClick={() => handleCollectionSelect(collection)}
                  className={styles.collectionButton}
                >
                  <Eye size={18} />
                  开始浏览
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

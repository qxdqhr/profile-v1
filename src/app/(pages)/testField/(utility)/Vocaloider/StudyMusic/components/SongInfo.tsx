import styles from '../StudyMusic.module.css';

interface SongInfoProps {
  title: string;
  artist: string;
  coverImage: string;
}

export default function SongInfo({ title, artist, coverImage }: SongInfoProps) {
  return (
    <div className={styles.songInfoContainer}>
      <div className={styles.albumCover}>
        <img 
          src={coverImage} 
          alt={`${artist} - ${title}`} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://via.placeholder.com/300x300?text=${title.replace(/\s+/g, '+')}`;
          }}
        />
      </div>
      
      <div className={styles.songInfo}>
        <h2>{artist}</h2>
      </div>
    </div>
  );
} 
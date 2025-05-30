import React from 'react';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/',
    img: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/',
    img: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
  },
  // 필요시 더 추가 가능
];

export default function RecommendChannels() {
  return (
    <div className="bg-white rounded p-4 flex flex-col items-center">
      <div className="font-bold mb-2">추천 채널</div>
      <div className="flex gap-4">
        {socialLinks.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-150 hover:scale-110 hover:shadow-lg"
            title={link.name}
          >
            <img
              src={link.img}
              alt={link.name}
              className="w-14 h-14 rounded-full border border-gray-200 object-cover bg-white shadow-sm"
            />
          </a>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">팔로우/구독하고 좋아요도 눌러주세요!</div>
    </div>
  );
} 
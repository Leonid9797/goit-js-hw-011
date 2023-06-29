import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
const API_KEY = '37968354-d4f7c033d18c1ecfffc2ea2ca';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.querySelector('.load-more');
const messageElement = document.getElementById('message');

let currentPage = 1;
const imagesPerPage = 40;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = form.elements.searchQuery.value;

  try {
    console.log('Sending request...');
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: imagesPerPage,
      },
    });
    console.log('successful');

    const data = response.data;
    const images = data.hits;
    totalHits = data.totalHits;

    if (images.length === 0) {
      showInfoMessage(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      clearGallery();
    } else {
      displayImages(images);

      checkLoadMoreButton();
      scrollPage();

      if (currentPage === 1) {
        showMessage(`Hooray! We found ${totalHits} images.`);
      }
    }
  } catch (error) {
    console.error(error);
    showErrorMessage('An error occurred. Please try again later.');
  }
});

loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  loadMoreImages();
});

const lightbox = new SimpleLightbox('.gallery a');

function displayImages(images) {
  if (currentPage === 1) {
    clearGallery();
  }

  images.forEach(image => {
    const photoCard = createPhotoCard(image);
    const link = document.createElement('a');
    link.href = image.webformatURL;
    link.appendChild(photoCard);
    gallery.appendChild(link);
  });

  lightbox.refresh();
}

function createPhotoCard(image) {
  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const imgElement = document.createElement('img');
  imgElement.src = image.webformatURL;
  imgElement.alt = image.tags;
  imgElement.loading = 'lazy';

  const infoDiv = document.createElement('div');
  infoDiv.classList.add('info');

  const likesParagraph = createInfoItem('Likes', image.likes);
  const viewsParagraph = createInfoItem('Views', image.views);
  const commentsParagraph = createInfoItem('Comments', image.comments);
  const downloadsParagraph = createInfoItem('Downloads', image.downloads);

  infoDiv.appendChild(likesParagraph);
  infoDiv.appendChild(viewsParagraph);
  infoDiv.appendChild(commentsParagraph);
  infoDiv.appendChild(downloadsParagraph);

  photoCard.appendChild(imgElement);
  photoCard.appendChild(infoDiv);

  return photoCard;
}

function createInfoItem(label, value) {
  const paragraph = document.createElement('p');
  paragraph.classList.add('info-item');
  paragraph.style.color = 'black';
  paragraph.innerHTML = `<b>${label}</b>: ${value}`;

  return paragraph;
}

function showInfoMessage(message) {
  console.log('Info:', message);
  Notiflix.Notify.info(message, {
    timeout: 3000,
    position: 'center',
  });
}

function showErrorMessage(message) {
  console.error('Error:', message);
  Notiflix.Notify.failure(message, {
    timeout: 3000,
    position: 'center',
  });
}

function clearGallery() {
  gallery.innerHTML = '';
}

function checkLoadMoreButton() {
  if (gallery.children.length >= totalHits) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function loadMoreImages() {
  form.dispatchEvent(new Event('submit'));
}

function showMessage(message) {
  messageElement.textContent = message;
  messageElement.style.display = 'block';
}

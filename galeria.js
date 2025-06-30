/* galeria.js - Versão atualizada com integração à API */

document.addEventListener('DOMContentLoaded', () => {
    // Gallery Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter gallery items
            const filter = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const close = document.querySelector('.close');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightbox.style.display = 'block';
            lightboxImg.src = item.querySelector('img').src;
            
            const caption = item.querySelector('.gallery-caption');
            if (caption) {
                lightboxCaption.innerHTML = caption.innerHTML;
            } else {
                lightboxCaption.innerHTML = '';
            }
        });
    });
    
    // Close lightbox
    if (close) {
        close.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }
    
    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }
    
    // Load user-submitted photos from API
    const loadUserPhotos = async () => {
        if (!window.ApiClient) return;
        
        try {
            const response = await window.ApiClient.getFotos();
            
            if (response.success && response.data && response.data.length > 0) {
                // Create a new section for user-submitted photos
                const userPhotosSection = document.createElement('div');
                userPhotosSection.className = 'user-photos-section';
                userPhotosSection.innerHTML = `
                    <h3>Fotos Enviadas pelos Convidados</h3>
                    <div class="user-photos-grid"></div>
                `;
                
                const userPhotosGrid = userPhotosSection.querySelector('.user-photos-grid');
                
                // Add photos to the grid
                response.data.forEach(foto => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'gallery-item user-photo';
                    
                    // In a real implementation, this would use the actual photo URL
                    // For this example, we'll use a placeholder
                    photoItem.innerHTML = `
                        <img src="https://via.placeholder.com/300x200?text=Foto+de+Convidado" alt="Foto enviada por ${foto.nome}">
                        <div class="gallery-caption">
                            <h3>Enviado por ${foto.nome}</h3>
                            <p>${foto.descricao || 'Sem descrição'}</p>
                        </div>
                    `;
                    
                    userPhotosGrid.appendChild(photoItem);
                    
                    // Add lightbox functionality
                    photoItem.addEventListener('click', () => {
                        lightbox.style.display = 'block';
                        lightboxImg.src = photoItem.querySelector('img').src;
                        lightboxCaption.innerHTML = photoItem.querySelector('.gallery-caption').innerHTML;
                    });
                });
                
                // Add the section to the page
                const gallerySection = document.querySelector('.galeria');
                if (gallerySection) {
                    gallerySection.appendChild(userPhotosSection);
                }
            }
        } catch (error) {
            console.error('Error loading user photos:', error);
        }
    };
    
    // Load user photos on page load
    loadUserPhotos();
    
    // Upload form handling with API integration
    const uploadForm = document.querySelector('.upload-form');
    const submitButton = uploadForm ? uploadForm.querySelector('button[type="submit"]') : null;
    const formStatus = document.createElement('div');
    formStatus.className = 'form-status';
    
    if (uploadForm) {
        uploadForm.appendChild(formStatus);
        
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable submit button and show loading
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Enviando...';
            }
            
            formStatus.innerHTML = '<p class="status-loading">Enviando sua foto...</p>';
            
            // Get form data
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const descricao = document.getElementById('descricao').value;
            const fotoInput = document.getElementById('foto');
            
            // In a real implementation, we would upload the file
            // For this example, we'll just send the metadata
            
            try {
                if (window.ApiClient) {
                    const fotoData = {
                        nome,
                        email,
                        descricao
                    };
                    
                    const response = await window.ApiClient.submitFoto(fotoData);
                    
                    if (response.success) {
                        formStatus.innerHTML = '<p class="status-success">Sua foto foi enviada com sucesso! Ela será exibida após aprovação. Obrigado.</p>';
                        uploadForm.reset();
                    } else {
                        formStatus.innerHTML = `<p class="status-error">Erro: ${response.error}</p>`;
                    }
                } else {
                    // Fallback for when API is not available
                    console.log('API client not available, using fallback');
                    setTimeout(() => {
                        formStatus.innerHTML = '<p class="status-success">Sua foto foi enviada com sucesso! (Modo demonstração)</p>';
                        uploadForm.reset();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error submitting photo:', error);
                formStatus.innerHTML = '<p class="status-error">Ocorreu um erro ao enviar sua foto. Por favor, tente novamente.</p>';
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Enviar Foto';
                }
            }
        });
    }
});


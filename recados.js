/* recados.js - Versão atualizada com integração à API */

document.addEventListener('DOMContentLoaded', () => {
    // Recados Form Handling
    const recadosForm = document.querySelector('.recados-form');
    const recadoTextarea = document.getElementById('recado');
    const recadosList = document.querySelector('.recados-list');
    const submitButton = recadosForm ? recadosForm.querySelector('button[type="submit"]') : null;
    const formStatus = document.createElement('div');
    formStatus.className = 'form-status';
    
    if (recadosForm) {
        recadosForm.appendChild(formStatus);
    }
    
    // Character limit for recado
    if (recadoTextarea) {
        recadoTextarea.addEventListener('input', () => {
            if (recadoTextarea.value.length > 500) {
                recadoTextarea.value = recadoTextarea.value.substring(0, 500);
            }
        });
    }
    
    // Load existing recados from API
    const loadRecados = async () => {
        if (!recadosList || !window.ApiClient) return;
        
        try {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'loading-recados';
            loadingElement.innerHTML = '<p>Carregando recados...</p>';
            recadosList.appendChild(loadingElement);
            
            const response = await window.ApiClient.getRecados();
            
            // Remove loading element
            loadingElement.remove();
            
            if (response.success && response.data) {
                // Clear existing recados
                recadosList.innerHTML = '';
                
                if (response.data.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-recados';
                    emptyMessage.innerHTML = '<p>Ainda não há recados. Seja o primeiro a deixar uma mensagem!</p>';
                    recadosList.appendChild(emptyMessage);
                    return;
                }
                
                // Add recados to the list
                response.data.forEach(recado => {
                    const recadoCard = createRecadoCard(recado);
                    recadosList.appendChild(recadoCard);
                });
            } else {
                console.error('Failed to load recados:', response.error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-recados';
                errorMessage.innerHTML = '<p>Não foi possível carregar os recados. Por favor, tente novamente mais tarde.</p>';
                recadosList.appendChild(errorMessage);
            }
        } catch (error) {
            console.error('Error loading recados:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-recados';
            errorMessage.innerHTML = '<p>Não foi possível carregar os recados. Por favor, tente novamente mais tarde.</p>';
            recadosList.appendChild(errorMessage);
        }
    };
    
    // Create recado card element
    const createRecadoCard = (recado) => {
        const recadoCard = document.createElement('div');
        recadoCard.className = 'recado-card';
        recadoCard.setAttribute('data-type', recado.relacao);
        
        recadoCard.innerHTML = `
            <div class="recado-header">
                <h4>${recado.nome}</h4>
                <span class="recado-relation">${getRelacaoText(recado.relacao)}</span>
                <span class="recado-date">${recado.data_formatada || 'Data não disponível'}</span>
            </div>
            <div class="recado-content">
                <p>${recado.recado}</p>
            </div>
        `;
        
        return recadoCard;
    };
    
    // Get relation text from relation value
    const getRelacaoText = (relacao) => {
        const relacoes = {
            'familia-noiva': 'Família da Noiva',
            'familia-noivo': 'Família do Noivo',
            'amigo-noiva': 'Amigo(a) da Noiva',
            'amigo-noivo': 'Amigo(a) do Noivo',
            'colega-trabalho': 'Colega de Trabalho',
            'outro': 'Outro'
        };
        
        return relacoes[relacao] || 'Outro';
    };
    
    // Load recados on page load
    loadRecados();
    
    // Form submission with API integration
    if (recadosForm) {
        recadosForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable submit button and show loading
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Enviando...';
            }
            
            formStatus.innerHTML = '<p class="status-loading">Enviando seu recado...</p>';
            
            // Get form values
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const relacao = document.getElementById('relacao').value;
            const recado = recadoTextarea.value;
            const isPublico = document.querySelector('input[name="publico"]').checked;
            
            if (!nome || !recado) {
                formStatus.innerHTML = '<p class="status-error">Por favor, preencha seu nome e recado.</p>';
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Enviar Recado';
                }
                return;
            }
            
            // Create data object
            const recadoData = {
                nome,
                email,
                relacao,
                recado,
                publico: isPublico
            };
            
            try {
                // Check if API client is available
                if (window.ApiClient) {
                    const response = await window.ApiClient.submitRecado(recadoData);
                    
                    if (response.success) {
                        formStatus.innerHTML = '<p class="status-success">Seu recado foi enviado com sucesso! Obrigado.</p>';
                        recadosForm.reset();
                        
                        // Reload recados to show the new one
                        loadRecados();
                    } else {
                        formStatus.innerHTML = `<p class="status-error">Erro: ${response.error}</p>`;
                    }
                } else {
                    // Fallback for when API is not available
                    console.log('API client not available, using fallback');
                    setTimeout(() => {
                        formStatus.innerHTML = '<p class="status-success">Seu recado foi enviado com sucesso! (Modo demonstração)</p>';
                        recadosForm.reset();
                        
                        // Add recado to the list (client-side only)
                        if (isPublico && recadosList) {
                            const today = new Date();
                            const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                            
                            const newRecado = {
                                nome,
                                relacao,
                                recado,
                                data_formatada: formattedDate
                            };
                            
                            const recadoCard = createRecadoCard(newRecado);
                            recadosList.insertBefore(recadoCard, recadosList.firstChild);
                        }
                    }, 1500);
                }
            } catch (error) {
                console.error('Error submitting recado:', error);
                formStatus.innerHTML = '<p class="status-error">Ocorreu um erro ao enviar seu recado. Por favor, tente novamente.</p>';
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Enviar Recado';
                }
            }
        });
    }
    
    // Recados Filtering
    const filtroRecados = document.getElementById('filtro-recados');
    
    if (filtroRecados) {
        filtroRecados.addEventListener('change', () => {
            const filtro = filtroRecados.value;
            const recadoCards = document.querySelectorAll('.recado-card');
            
            recadoCards.forEach(card => {
                const type = card.getAttribute('data-type');
                
                if (filtro === 'todos') {
                    card.style.display = 'block';
                } else if (filtro === 'amigos' && (type === 'amigo-noiva' || type === 'amigo-noivo')) {
                    card.style.display = 'block';
                } else if (filtro === 'familia-noiva' && type === 'familia-noiva') {
                    card.style.display = 'block';
                } else if (filtro === 'familia-noivo' && type === 'familia-noivo') {
                    card.style.display = 'block';
                } else if (filtro === 'recentes') {
                    // All cards are shown, but we would sort them by date in a real implementation
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});


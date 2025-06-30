/* presentes.js - Versão atualizada com integração à API */

document.addEventListener('DOMContentLoaded', () => {
    // Gift Option Tabs
    const giftOptionCards = document.querySelectorAll('.gift-option-card');
    const giftContents = document.querySelectorAll('.gift-content');
    
    giftOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Update active card
            giftOptionCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Show corresponding content
            const option = card.getAttribute('data-option');
            giftContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${option}-content`).classList.add('active');
        });
    });
    
    // Copy PIX key to clipboard
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-copy');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copiado!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            });
        });
    });
    
    // Copy PIX data-value to clipboard
    const pixCopyButton = document.querySelector('.value-btn[data-value="c10631cd-8abd-4173-9e5b-f03be0b9e561"]');
    if (pixCopyButton) {
        pixCopyButton.addEventListener('click', () => {
            const textToCopy = pixCopyButton.getAttribute('data-value');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = pixCopyButton.textContent;
                pixCopyButton.textContent = 'Copiado!';
                pixCopyButton.style.backgroundColor = '#28a745';
                pixCopyButton.style.color = 'white';
                setTimeout(() => {
                    pixCopyButton.textContent = originalText;
                    pixCopyButton.style.backgroundColor = '';
                    pixCopyButton.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar para clipboard:', err);
                alert('Erro ao copiar. Por favor, copie manualmente: ' + textToCopy);
            });
        });
    }
    
    // Load progress data from API
    const loadProgressData = async () => {
        const progressBar = document.querySelector('.progress');
        const progressInfo = document.querySelector('.progress-info');
        
        if (!progressBar || !progressInfo || !window.ApiClient) return;
        
        try {
            const response = await window.ApiClient.getPresentesTotal();
            
            if (response.success && response.data) {
                const { total, count } = response.data;
                const goal = 10000; // Meta fixa para este exemplo
                const percentage = Math.min(Math.round((total / goal) * 100), 100);
                
                // Update progress bar
                progressBar.style.width = `${percentage}%`;
                
                // Update progress info
                progressInfo.innerHTML = `
                    <span>R$ ${total.toLocaleString('pt-BR')} de R$ ${goal.toLocaleString('pt-BR')}</span>
                    <span>${percentage}% alcançado</span>
                `;
            }
        } catch (error) {
            console.error('Error loading progress data:', error);
        }
    };
    
    // Load progress data on page load
    loadProgressData();
    
    // Process contribution
    const processContribution = async (nome, email, valor, tipo, descricao = '') => {
        if (!window.ApiClient) {
            // Fallback for when API is not available
            console.log('API client not available, using fallback');
            alert(`Contribuição processada com sucesso! (Modo demonstração)\nValor: R$ ${valor}\nTipo: ${tipo}`);
            return true;
        }
        
        try {
            const contribuicaoData = {
                nome,
                email,
                valor: parseFloat(valor),
                tipo,
                descricao
            };
            
            const response = await window.ApiClient.submitContribuicao(contribuicaoData);
            
            if (response.success) {
                alert(`Contribuição processada com sucesso!\nValor: R$ ${valor}\nTipo: ${tipo}`);
                
                // Reload progress data
                loadProgressData();
                
                return true;
            } else {
                alert(`Erro ao processar contribuição: ${response.error}`);
                return false;
            }
        } catch (error) {
            console.error('Error processing contribution:', error);
            alert('Ocorreu um erro ao processar sua contribuição. Por favor, tente novamente.');
            return false;
        }
    };
    
    // Handle virtual gift buttons
    const giftButtons = document.querySelectorAll('.gift-btn');
    giftButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const giftCard = button.closest('.gift-card');
            const giftName = giftCard.querySelector('h4').textContent;
            const giftPrice = giftCard.querySelector('.gift-price').textContent;
            const valor = giftPrice.replace('R$ ', '').replace('.', '').replace(',', '.');
            
            // Get user info
            const nome = prompt('Por favor, digite seu nome:');
            if (!nome) return;
            
            const email = prompt('Por favor, digite seu email:');
            if (!email) return;
            
            await processContribution(nome, email, valor, 'presente_virtual', giftName);
        });
    });
    
    // Handle experience buttons
    const expButtons = document.querySelectorAll('.exp-btn:not(.custom-exp)');
    expButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const valor = button.getAttribute('data-value');
            const expCard = button.closest('.experience-card');
            const expName = expCard.querySelector('h4').textContent;
            
            // Get user info
            const nome = prompt('Por favor, digite seu nome:');
            if (!nome) return;
            
            const email = prompt('Por favor, digite seu email:');
            if (!email) return;
            
            await processContribution(nome, email, valor, 'lua_de_mel', expName);
        });
    });
    
    // Handle custom experience value buttons
    const customExpButtons = document.querySelectorAll('.custom-exp');
    customExpButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const expCard = button.closest('.experience-card');
            const expName = expCard.querySelector('h4').textContent;
            
            const customValue = prompt('Digite o valor desejado (apenas números):');
            if (!customValue || isNaN(customValue) || customValue <= 0) {
                alert('Por favor, digite um valor válido.');
                return;
            }
            
            // Get user info
            const nome = prompt('Por favor, digite seu nome:');
            if (!nome) return;
            
            const email = prompt('Por favor, digite seu email:');
            if (!email) return;
            
            await processContribution(nome, email, customValue, 'lua_de_mel', expName);
        });
    });
    
    // Gift message form handling
    const giftMessageForm = document.querySelector('.gift-message-form');
    const formStatus = document.createElement('div');
    formStatus.className = 'form-status';
    
    if (giftMessageForm) {
        giftMessageForm.appendChild(formStatus);
        
        giftMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(giftMessageForm);
            const nome = formData.get('gift-name');
            const email = formData.get('gift-email');
            const mensagem = formData.get('gift-message');
            
            // Create email content
            const subject = 'Mensagem de Presente - Bianca & Alan';
            const body = `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`;
            
            // Create mailto link
            const mailtoLink = `mailto:alan.amaral@eship.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Open email client
            window.open(mailtoLink, '_blank');
            
            // Show success message
            formStatus.innerHTML = '<p class="status-success">Sua mensagem foi enviada com sucesso! Obrigado.</p>';
            giftMessageForm.reset();
            
            setTimeout(() => {
                formStatus.innerHTML = '';
            }, 5000);
        });
    }
});


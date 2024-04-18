document.addEventListener('DOMContentLoaded', function () {

    // Chave da API
    const key = "a2eb0d3492a090ba37f01646793e49ba"

    // Botão de busca
    const btnBuscar = document.getElementById('btnBuscar')

    // Função para obter a localização atual
    async function obterLocalizacaoAtual() {

        // Teste se o navegador suportar geolocalização
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (posicao) {
                const latitude = posicao.coords.latitude
                const longitude = posicao.coords.longitude

                console.log(`latitude: ${latitude}, longitude: ${longitude}`)
                buscarTempoAtualLatLon(latitude, longitude);
            }, function (error) {
                console.error('Erro ao obter localização:', error)
            })
        } else {
            console.log('Navegador não suporta API de geolocalização')
        }
    }

    // Inicialização da função para obter a localização atual
    obterLocalizacaoAtual()

    // Função para buscar o tempo atual com base na latitude e longitude
    async function buscarTempoAtualLatLon(latitude, longitude) {
        try {
            let dadosTempo = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric&lang=pt`).then(resposta => resposta.json());

            exibirTempoAtualCidade(dadosTempo)
            // Obtém a previsão do tempo para os próximos 5 dias utilizando as coordenadas
            buscarPrevisao24HorasE5Dias([latitude, longitude])
        } catch (error) {
            console.error('Erro ao buscar dados do servidor', error)
        }
    }

   // Função para buscar o tempo atual com base no nome da cidade
async function buscarTempoAtualCidade() {
    try {
        let inputCidade = document.getElementById('cidade').value.trim(); // Adicionado trim() para remover espaços em branco desnecessários

        // Verifica se o campo de entrada da cidade está vazio
        if (inputCidade === '') {
            alert('Por favor, digite o nome de uma cidade');
            return; // Sai da função se o campo estiver vazio
        }

        let dadosTempo = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputCidade}&appid=${key}&units=metric&lang=pt`).then(resposta => resposta.json());

        console.log(dadosTempo);
        exibirTempoAtualCidade(dadosTempo);

        buscarPrevisao24HorasE5Dias(inputCidade);
        resetarPosicaoDeRolagem();
    } catch (error) {
        console.error('Erro', error);
        alert('Ocorreu um erro ao buscar dados do servidor');
    }
}


    // Função para exibir o tempo atual da cidade
    function exibirTempoAtualCidade(dados) {
        let nomeCidade = document.getElementById('nomeCidade');
        let temperaturaAtual = document.getElementById('temperaturaAtual')
        let temperaturaMaxHoje = document.getElementById('temperaturaMaxHoje')
        let temperaturaMinHoje = document.getElementById('temperaturaMinHoje')
        let imagemAtualPrevisao = document.getElementById('imagemAtualPrevisao')
        let txtAtualPrevisao = document.getElementById('txtAtualPrevisao')

        let inputCidade = document.getElementById('cidade')
        inputCidade.value = ''

        let icone = dados.weather[0].icon;
        let iconeURL = `https://openweathermap.org/img/wn/${icone}.png`

        nomeCidade.textContent = dados.name;
        temperaturaAtual.textContent = `${dados.main.temp.toFixed(0)} °C`
        temperaturaMaxHoje.textContent = `Max: ${dados.main.temp_max.toFixed(0)} °C`
        temperaturaMinHoje.textContent = `Min: ${dados.main.temp_min.toFixed(0)} °C`
        imagemAtualPrevisao.src = iconeURL;
        txtAtualPrevisao.textContent = dados.weather[0].description
    }

    // Função para buscar a previsão do tempo para os próximas 24horas e 5 dias
    async function buscarPrevisao24HorasE5Dias(cidadeOuLatLon) {
        try {
            let endpoint;
            if (typeof cidadeOuLatLon === 'string') {
                // Se a entrada for uma string, assume-se que é o nome da cidade
                endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${cidadeOuLatLon}&appid=${key}&units=metric&lang=pt`
            } else if (Array.isArray(cidadeOuLatLon)) {
                // Se a entrada for um array, assume-se que é [latitude, longitude]
                endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${cidadeOuLatLon[0]}&lon=${cidadeOuLatLon[1]}&appid=${key}&units=metric&lang=pt`
            } else {
                console.error('Entrada inválida. Por favor, forneça o nome da cidade ou [latitude, longitude].')
                return;
            }

            // Faz uma solicitação para obter a previsão do tempo para os próximas 24Horas 5 dias
            let dadosPrevisao = await fetch(endpoint).then(resposta => resposta.json())

            console.log(dadosPrevisao)
            // Exibe a previsão do tempo para os próximass 24Horas 5 dias
            exibirPrevisao24Horas(dadosPrevisao)
            exibirPrevisao5Dias(dadosPrevisao)
        } catch (error) {
            console.error('Erro ao buscar dados do servidor', error)
        }
    }

    // Função para exibir a previsão do tempo para os próximas 24Hrs
    async function exibirPrevisao24Horas(dados, unidadeTempo) {
        // Limpa o conteúdo anterior
        const previsaoHora = document.querySelector('.previsaoHora')
        previsaoHora.innerHTML = ''

        // Obtém o horário atual e arredonda para o próximo horário de 3 em 3 horas
        const horaAtual = new Date()
        const proximaHora = new Date()
        proximaHora.setHours(Math.ceil(horaAtual.getHours() / 3) * 3, 0, 0, 0)

        // Loop através dos dados de previsão para as próximas 24 horas
        for (let i = 0; i < 8; i++) { // 8 para exibir as próximas 24 horas a cada 3 horas
            const item = dados.list[i]
            const horaPrevisao = new Date(item.dt * 1000) // Convertendo para milissegundos
            const horaFormatada = horaPrevisao.getHours() // Obtém a hora do dia

            // Verifica se os dados de previsão para esta hora existem e se estão no futuro
            if (horaPrevisao >= horaAtual && horaPrevisao >= proximaHora) {
                const temperatura = item.main.temp.toFixed(0)
                const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`; // URL do ícone do tempo

                // Cria um contêiner para cada previsão
                const previsaoContainer = document.createElement('div')
                previsaoContainer.classList.add('previsaoItem')

                // Cria os elementos de parágrafo para exibir a hora e a temperatura
                const paragrafoHora = document.createElement('p')
                paragrafoHora.textContent = `${horaFormatada < 10 ? '0' : ''}${horaFormatada}:00`

                const paragrafoTemperatura = document.createElement('p')
                paragrafoTemperatura.textContent = `${temperatura} °C`

                // Cria um elemento de imagem para exibir o ícone do tempo
                const imgIconeTempo = document.createElement('img')
                imgIconeTempo.src = iconUrl

                // Adiciona os elementos de parágrafo e imagem ao contêiner da previsão
                previsaoContainer.appendChild(paragrafoHora)
                previsaoContainer.appendChild(imgIconeTempo)
                previsaoContainer.appendChild(paragrafoTemperatura)

                // Adiciona o contêiner da previsão ao conteúdo da previsão principal
                previsaoHora.appendChild(previsaoContainer)

                // Incrementa a próxima hora para o próximo horário de 3 em 3 horas
                proximaHora.setHours(proximaHora.getHours() + 3)
            }
        }
    }


    // Função para exibir a previsão do tempo para os próximos 5 dias
    function exibirPrevisao5Dias(dados) {
        // Limpa o conteúdo anterior
        const containerPrevisao5Dias = document.querySelector('.containerPrevisao5Dias')
        containerPrevisao5Dias.innerHTML = ''

        // Adiciona o título
        const titulo = document.createElement('h2')
        titulo.textContent = 'Previsão para os próximos 5 dias'
        containerPrevisao5Dias.appendChild(titulo)

        // Array para armazenar os dias da semana
        const diasSemana = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.']

        // Objeto para armazenar os dados de previsão por dia
        const previsaoPorDia = {}

        // Obtém a data de amanhã
        let dataAmanha = new Date()

        // Loop através dos dados de previsão para os próximos 5 dias a partir de amanhã
        for (let i = 0; i < dados.list.length; i++) {
            const item = dados.list[i]
            const dataPrevisao = new Date(item.dt * 1000) // Convertendo para milissegundos
            const diaSemana = diasSemana[dataPrevisao.getDay()]

            // Verifica se o dia é a partir de amanhã e se ainda não foram coletados 5 dias
            if (dataPrevisao >= dataAmanha && Object.keys(previsaoPorDia).length < 5) {
                // Se o dia ainda não foi registrado, cria um objeto para esse dia
                if (!previsaoPorDia[diaSemana]) {
                    previsaoPorDia[diaSemana] = {
                        maxima: -Infinity,
                        minima: Infinity,
                        iconUrl: item.weather[0].icon
                    };
                }
                // Atualiza a temperatura máxima e mínima para o dia correspondente
                previsaoPorDia[diaSemana].maxima = Math.max(previsaoPorDia[diaSemana].maxima, item.main.temp_max)
                previsaoPorDia[diaSemana].minima = Math.min(previsaoPorDia[diaSemana].minima, item.main.temp_min)
            }
        }

        // Loop através dos dados agrupados por dia e exibe a média
        Object.keys(previsaoPorDia).forEach(diaSemana => {
            const temperaturaMax = previsaoPorDia[diaSemana].maxima.toFixed(0)
            const temperaturaMin = previsaoPorDia[diaSemana].minima.toFixed(0)
            const iconUrl = previsaoPorDia[diaSemana].iconUrl

            // Cria um contêiner flexível para agrupar o texto e a imagem
            const divPrevisao = document.createElement('div')
            divPrevisao.classList.add('previsaoItem5Dias')

            // Cria um elemento de parágrafo para exibir o dia da semana
            const paragrafoDia = document.createElement('p')
            paragrafoDia.textContent = diaSemana

            // Cria um elemento de imagem para exibir o ícone do tempo
            const imgIconeTempo = document.createElement('img')
            imgIconeTempo.src = `https://openweathermap.org/img/wn/${iconUrl}.png`

            // Cria elementos de parágrafo para exibir a máxima e a mínima do dia
            const temperaturaMaxDia = document.createElement('p')
            temperaturaMaxDia.textContent = `Máx: ${temperaturaMax} °C`
            temperaturaMaxDia.style.color = '#479ec9'

            const temperaturaMinDia = document.createElement('p')
            temperaturaMinDia.textContent = `Mín: ${temperaturaMin} °C`
            temperaturaMinDia.style.color = '#D21C29'

            // Adiciona os elementos ao contêiner de previsão
            divPrevisao.appendChild(paragrafoDia)
            divPrevisao.appendChild(imgIconeTempo)
            divPrevisao.appendChild(temperaturaMaxDia)
            divPrevisao.appendChild(temperaturaMinDia)

            containerPrevisao5Dias.appendChild(divPrevisao)
        });
    }


    // Listener para o botão de busca
    btnBuscar.addEventListener('click', function () {
        buscarTempoAtualCidade()
    });


    // Função para buscar a cidade quando o usuário pressionar Enter
    const buscarCidadeAoPressionarEnter = () => {
        // Adiciona um ouvinte de eventos para o campo de entrada da cidade
        document.getElementById('cidade').addEventListener('keydown', (event) => {
            // Verifica se a tecla pressionada é a tecla Enter (código 13)
            if (event.key === 'Enter') {
                // Chama a função para buscar o tempo atual da cidade
                buscarTempoAtualCidade()
                // Redefine a posição de rolagem
                resetarPosicaoDeRolagem()
            }
        });
    };

    // Chama a função para buscar a cidade ao pressionar Enter
    buscarCidadeAoPressionarEnter();

    // Listener para o botão de rolagem para a esquerda
    document.querySelector('.scrollLeft').addEventListener('click', function () {
        document.querySelector('.previsaoHora').scrollBy({
            left: -100,
            behavior: 'smooth'
        });
    });

    // Listener para o botão de rolagem para a esquerda
    document.querySelector('.scrollRight').addEventListener('click', function () {
        document.querySelector('.previsaoHora').scrollBy({
            left: 100,
            behavior: 'smooth'
        });
    });

    // Reseta a posição do scroll na sessão previsão 24hrs
    function resetarPosicaoDeRolagem() {
        document.querySelector('.previsaoHora').scrollTo({
            left: 0,
            top: 0,
            behavior: 'auto'
        });
    }

});

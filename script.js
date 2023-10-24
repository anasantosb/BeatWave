function startGame() {
    var apelido = document.getElementById('usuario').value;

    if (apelido == '') {
        alert('Informe um apelido');
        return false;
    } else {
        var apelidos = JSON.parse(localStorage.getItem('apelidos')) || [];
        apelidos.push(apelido);
        localStorage.setItem('apelidos', JSON.stringify(apelidos));
        window.location.href = "game.html";
        return false;
    }
}

function f_paginajogo(){
    window.location.href = "game.html";
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-game').addEventListener('click', function(event) {
        event.preventDefault();
        startGame();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('ranking').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = "ranking.html";
    });
});

let player;
let trackName;
let pontos = 0;
let contador_musicas = 0;
let erros = 0;
let connect_to_device;
function atualizarPontuacao() {
    const pontuacaoElement = document.getElementById("pontuacao");
    pontuacaoElement.innerText = pontos;
}

function decrementarPontos() {
    if (pontos < 0) {
        pontos = 0;  // Garante que a pontuação não seja negativa
    }
    atualizarPontuacao();
}

function reiniciarJogo() {
    alert("Você errou 3 vezes e perdeu o jogo!");
    window.location.href = "index.html"; // Redireciona para a página de entrada
}

//function getToken() {
    //fetch("token.json")
      //.then((response) => response.json())
      //.then((data) => {
        //token = data.token;
      //});
  //}
  //getToken();

window.onSpotifyWebPlaybackSDKReady = () => {
    token = 'BQBSXowz5DbYEEBY7NMX3Hyf2yqE2kfZ2dXLb7xmtzHHfiSYTekNJEOok0yR0cMGuTZG2AwKq3CmeQu0cB5sY_xZYWRzKQhtnSlfIfFHn11OlOLupX5khGJfDsu6z4j3GnLN5woTNsJeBhETicv5s-o9XQmPkfrxVnPIb0Ln9xuyQB9WfgvfTUFrpkXkbC-l7MX3xdvxsP44D-rx3-D7mBitubpx'
    player = new Spotify.Player({
        name: "Web Playback SDK Quick Start Player",
        getOAuthToken: (cb) => {
            cb(token);
        },
        volume: 0.5,
    });
  //um array com os albuns que serão usados no jogo
  let album_uri = [
    'spotify:playlist:52zqBFUUiCkDhCwnbOgsiR',
    'spotify:playlist:7KNmVw9v0nBKzjoEYcxzOh',
    'spotify:playlist:7JLXnCNAsjCUsvQyD8kmK6'
  ];
  //função para escolher um album aleatorio do array
  let randomAlbum = album_uri[Math.floor(Math.random() * album_uri.length)];
  album_uri = randomAlbum;
//console.log(album_uri);
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        connect_to_device = () => {
            //espera o usuario selecionar o album para continuar
              if (!album_uri) {
                setTimeout(connect_to_device, 1000);
                return;
              }
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    context_uri: album_uri,
                    play: false,
                }),
                headers: new Headers({
                    "Authorization": "Bearer " + token,
                }),
            }).then(response => console.log(response))
            .then(data => {
                player.addListener('player_state_changed', ({
                    track_window
                }) => {
                    trackName = track_window.current_track.name;
                    trackName = trackName.toLowerCase();
                    //tira acentos e caracteres especiais
                    trackName = trackName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                    //console.log('Current Track:', trackName);

                });
            });
        }
    });
let isConnected;
let click=0;
    document.getElementById("play-music").addEventListener('click', (e) => {
        //previne que a pagina seja recarregada zerando a pontuação
        e.preventDefault();
        if (!isConnected) {
              connect_to_device();
              isConnected = true;
        }
        if(click>1){
            if (!player.getCurrentState().paused) {
                pontos -= 2;
                decrementarPontos();
            }
        }
        player.togglePlay();
        setTimeout(() => {
            player.pause();
        }, 10000);
    click++;
    });

    document.getElementById("btn-resposta").addEventListener('click', (event) => {
        event.preventDefault();
        let resposta = document.getElementById("resposta").value;
        //tira acentos e caracteres especiais
        resposta = resposta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        if (resposta == trackName) {
            alert("Você Acertou, Parabéns!");
            pontos += 10;
            atualizarPontuacao();
            contador_musicas++;
            //console.log('contador:'+contador_musicas);

            // nesse bloco é onde verifica-se o numero de musicas, exemplo: se 10 musicas, ele finaliza o jogo e insere a pontuação do jogador
            if(contador_musicas === 8){
                alert('PARABÉNS, Você finalizou o jogo!!!');
                var v_pontuacao = JSON.parse(localStorage.getItem('pontos_jogador')) || [];
                v_pontuacao.push(pontos);
                localStorage.setItem('pontos_jogador', JSON.stringify(v_pontuacao));
                window.location.href = "index.html";
            }
            // Avance para a próxima música
            player.nextTrack();
            // Reinicie o temporizador para pausar a próxima música após 10 segundos
            setTimeout(() => {
                player.pause();
            }, 10000);
            // Limpar a caixa de resposta
            document.getElementById('resposta').value='';
        } else {
            document.getElementById('resposta').value='';
            alert("Você errou, tente novamente!");
            erros++;
            pontos -= 5;
            decrementarPontos();  // Subtrai pontos quando o usuário erra
            if (erros === 3) {
                var v_pontuacao = JSON.parse(localStorage.getItem('pontos_jogador')) || [];
                v_pontuacao.push(pontos);
                localStorage.setItem('pontos_jogador', JSON.stringify(v_pontuacao));
                reiniciarJogo();
            }
        }
    });

    player.connect();
};

document.addEventListener("DOMContentLoaded", function() {
    var video = document.getElementById("background-video");
    exibirRanking();

    video.addEventListener("mouseenter", function() {
        video.controls = true;
    });

    video.addEventListener("mouseleave", function() {
        video.controls = false;
    });


});


function exibirRanking() {
    // Verifica se está na página do ranking
    var listaRanking = document.getElementById('lista-ranking');
    if (!listaRanking) {
        // Se não estiver na página do ranking, não faz nada
        return;
    }

    // pega todos os apelidos e pontuações registrados
    var apelidos = JSON.parse(localStorage.getItem('apelidos')) || [];
    var v_pontuacao = JSON.parse(localStorage.getItem('pontos_jogador')) || [];

    if (apelidos.length === 0) {
        // se não tiver apelidos, mostra a mensagem
        listaRanking.innerHTML = '<li>Nenhum jogador registrado</li>';
    } else {
        // Cria um array de objetos representando jogadores
        var jogadores = [];
        for (var i = 0; i < apelidos.length; i++) {
            jogadores.push({ apelido: apelidos[i], pontuacao: v_pontuacao[i] });
        }

        // Ordena os jogadores com base na pontuação (do maior para o menor)
        jogadores.sort(function(a, b) {
            return b.pontuacao - a.pontuacao;
        });

        // itera sobre os jogadores ordenados e cria os itens da lista
        for (var j = 0; j < jogadores.length; j++) {
            if (j<=2){
                var jogadorItem = document.createElement('li');
                jogadorItem.textContent = jogadores[j].apelido + ' - Pontuação: ' + jogadores[j].pontuacao;
                listaRanking.appendChild(jogadorItem);
            }

        }
    }
}

function limparRanking() {
    localStorage.clear();
    window.location.reload();
}

function confirmExit() {
    var confirmMessage = "Tem certeza que deseja sair? Seus pontos serão perdidos.";
    if (confirm(confirmMessage)) {
        pontos = 0;
        var v_pontuacao = JSON.parse(localStorage.getItem('pontos_jogador')) || [];
        v_pontuacao.push(pontos);
        localStorage.setItem('pontos_jogador', JSON.stringify(v_pontuacao));
        // Redirecione para a página inicial
        window.location.href = "index.html";
    }
}

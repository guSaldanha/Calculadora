// ---------- Elementos da tela ----------
const visorResultado = document.getElementById("resultado");
const visorExpressao = document.getElementById("expressao");
const teclas = document.getElementById("teclas");

// ---------- Estado da calculadora ----------
let atual = "0";        // número que está sendo digitado (como texto)
let anterior = null;    // primeiro número da conta
let operador = null;    // "+", "-", "*", "/" ou "^"
let novoNumero = false; // true = o próximo dígito começa um número novo
let ultimaConta = "";   // texto da última conta (ex.: "2 + 3 =")

const simbolos = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };
const MAX_DIGITOS = 12;

// ---------- Exibição ----------
// Troca ponto por vírgula e coloca separador de milhar (1234.5 -> 1.234,5)
function formatar(valor) {
  if (valor === "Erro" || valor.includes("e")) return valor;

  // Separa o sinal de negativo, para formatar só os números
  const negativo = valor.startsWith("-");
  const semSinal = negativo ? valor.slice(1) : valor;

  // Separa a parte inteira da parte decimal ("1234.5" -> "1234" e "5")
  const [inteiro, decimal] = semSinal.split(".");

  // Percorre a parte inteira de trás para frente,
  // colocando um ponto a cada 3 dígitos
  let comMilhar = "";
  let contador = 0;
  for (let i = inteiro.length - 1; i >= 0; i--) {
    if (contador === 3) {
      comMilhar = "." + comMilhar;
      contador = 0;
    }
    comMilhar = inteiro[i] + comMilhar;
    contador++;
  }

  // Monta o resultado: sinal + inteiro + vírgula + decimal
  let resultado = comMilhar;
  if (decimal !== undefined) resultado += "," + decimal;
  if (negativo) resultado = "-" + resultado;

  return resultado;
}

function atualizarTela() {
  visorResultado.textContent = formatar(atual);

  if (anterior !== null) {
    visorExpressao.textContent = `${formatar(anterior)} ${simbolos[operador]}`;
  } else {
    visorExpressao.textContent = ultimaConta;
  }
}

// ---------- Operações (uma função para cada) ----------
// valor1 = primeiro número da conta | valor2 = número que está no visor
// O resultado volta para o visor (variável "atual").
// parseFloat tira os zeros que sobram do toFixed (3.00 vira 3).

function soma() {
  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  const resultado = valor1 + valor2;
  atual = String(parseFloat(resultado.toFixed(2)));
}

function subtracao() {
  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  const resultado = valor1 - valor2;
  atual = String(parseFloat(resultado.toFixed(2)));
}

function multiplicar() {
  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  const resultado = valor1 * valor2;
  atual = String(parseFloat(resultado.toFixed(2)));
}

function dividir() {
  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  const resultado = valor1 / valor2;
  atual = String(parseFloat(resultado.toFixed(2)));
}

function potencia() {
  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  const resultado = valor1 ** valor2;
  atual = String(parseFloat(resultado.toFixed(2)));
}

function porcentagem() {
  if (atual === "Erro") return;

  const valor1 = parseFloat(anterior);
  const valor2 = parseFloat(atual);
  let resultado;

  if (operador === "+" || operador === "-") {
    // Em soma e subtração: valor2 por cento de valor1
    // Ex.: 200 + 10%  ->  (200 * 10) / 100 = 20  ->  200 + 20 = 220
    resultado = (valor1 * valor2) / 100;
  } else {
    // Sem conta pendente (ou em ×, ÷ e ^), só divide por 100
    // Ex.: 50 %  ->  0,5
    resultado = valor2 / 100;
  }

  atual = String(parseFloat(resultado.toFixed(2)));

  // Sem conta pendente, o próximo dígito começa um número novo
  if (operador === null) novoNumero = true;

  atualizarTela();
}

// ---------- Ações ----------
function inserirDigito(digito) {
  if (novoNumero) {
    atual = "0";
    novoNumero = false;
    if (operador === null) ultimaConta = "";
  }
  if (atual.replace(/[-.]/g, "").length >= MAX_DIGITOS) return;
  atual = atual === "0" ? digito : atual + digito;
  atualizarTela();
}

function inserirDecimal() {
  if (novoNumero) {
    atual = "0";
    novoNumero = false;
    if (operador === null) ultimaConta = "";
  }
  if (!atual.includes(".")) atual += ".";
  atualizarTela();
}

function escolherOperador(op) {
  if (atual === "Erro") return;
  // Se já existe uma conta pendente, resolve antes de continuar (2 + 3 + ...)
  if (operador !== null && !novoNumero) calcular(true);
  if (atual === "Erro") return;
  anterior = atual;
  operador = op;
  novoNumero = true;
  ultimaConta = "";
  atualizarTela();
}

function calcular(encadeado = false) {
  if (operador === null || anterior === null) return;

  // Divisão por zero: mostra erro
  if (operador === "/" && parseFloat(atual) === 0) {
    limpar();
    atual = "Erro";
    novoNumero = true;
    atualizarTela();
    return;
  }

  // Guarda o texto da conta antes de o visor mudar
  if (!encadeado) {
    ultimaConta = `${formatar(anterior)} ${simbolos[operador]} ${formatar(atual)} =`;
  }

  // Chama a função da operação escolhida
  if (operador === "+") soma();
  else if (operador === "-") subtracao();
  else if (operador === "*") multiplicar();
  else if (operador === "/") dividir();
  else if (operador === "^") potencia();

  // Resultados impossíveis (ex.: raiz de número negativo) viram erro
  if (!isFinite(parseFloat(atual))) {
    atual = "Erro";
    ultimaConta = "";
  }

  anterior = null;
  operador = null;
  novoNumero = true;
  atualizarTela();
}

function limpar() {
  atual = "0";
  anterior = null;
  operador = null;
  novoNumero = false;
  ultimaConta = "";
  atualizarTela();
}

function apagar() {
  if (novoNumero || atual === "Erro") return;
  const ficaVazio = atual.length === 1 || (atual.length === 2 && atual.startsWith("-"));
  atual = ficaVazio ? "0" : atual.slice(0, -1);
  atualizarTela();
}

function inverterSinal() {
  if (atual === "0" || atual === "Erro") return;
  atual = atual.startsWith("-") ? atual.slice(1) : "-" + atual;
  atualizarTela();
}

// ---------- Cliques nas teclas ----------
teclas.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;

  if (botao.dataset.num) inserirDigito(botao.dataset.num);
  else if (botao.dataset.op) escolherOperador(botao.dataset.op);
  else {
    const acoes = {
      limpar,
      apagar,
      decimal: inserirDecimal,
      igual: () => calcular(),
      inverter: inverterSinal,
      porcento: porcentagem,
    };
    acoes[botao.dataset.acao]?.();
  }
});

// ---------- Suporte ao teclado ----------
document.addEventListener("keydown", (evento) => {
  const tecla = evento.key;

  if (/^\d$/.test(tecla)) inserirDigito(tecla);
  else if (tecla === "." || tecla === ",") inserirDecimal();
  else if ("+-*/^".includes(tecla)) escolherOperador(tecla);
  else if (tecla === "Enter" || tecla === "=") {
    evento.preventDefault();
    calcular();
  }
  else if (tecla === "Backspace") apagar();
  else if (tecla === "Escape") limpar();
  else if (tecla === "%") porcentagem();
});

atualizarTela();
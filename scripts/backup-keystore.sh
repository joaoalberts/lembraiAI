#!/usr/bin/env bash
# Copia o keystore de release para o iCloud Drive: uma cópia FORA do Mac. O arquivo é protegido pela própria senha (26 caracteres aleatórios).
# NÃO copia keystore.env (as senhas): guarde-as no seu gerenciador de senhas. Sem elas, o backup não abre; sem o backup, elas não servem.
#   scripts/backup-keystore.sh                 -> ~/Library/Mobile Documents/com~apple~CloudDocs/joaoai-backups/keystore/
#   scripts/backup-keystore.sh /outra/pasta    -> em outro lugar (disco externo, por exemplo)
set -euo pipefail
ORIGEM="${LEMBREIAI_KEYS_DIR:-$HOME/.lembreiai/keys}/lembreiai-release.keystore"
DESTINO="${1:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/joaoai-backups/keystore}"
[ -f "$ORIGEM" ] || { echo "não achei $ORIGEM"; exit 1; }
mkdir -p "$DESTINO"
ARQUIVO="$DESTINO/lembreiai-release-$(date +%F).keystore"
[ -e "$ARQUIVO" ] && { echo "já existe: $ARQUIVO (nada foi sobrescrito)"; exit 0; }
cp "$ORIGEM" "$ARQUIVO"
chmod 600 "$ARQUIVO"
SHA_ORIGEM="$(shasum -a 256 "$ORIGEM" | cut -d' ' -f1)"
SHA_COPIA="$(shasum -a 256 "$ARQUIVO" | cut -d' ' -f1)"
[ "$SHA_ORIGEM" = "$SHA_COPIA" ] || { echo "a cópia não confere com o original; removendo"; rm -f "$ARQUIVO"; exit 1; }
cat > "$DESTINO/LEIA-ME.txt" <<TXT
Backup do keystore de assinatura do app LembreiAi (Android).
Atualizado em $(date +%F).

- Arquivo: $(basename "$ARQUIVO")  (SHA-256: $SHA_COPIA)
- Alias da chave: lembreiai
- AS SENHAS NÃO ESTÃO AQUI. Ficam no gerenciador de senhas do dono (originalmente em ~/.lembreiai/keys/keystore.env no Mac).
- Sem este arquivo e as duas senhas não dá para atualizar o app já instalado nos celulares (as pessoas teriam de desinstalar e instalar de novo).
- Conferir depois de restaurar: keytool -list -keystore <arquivo>   (pede a senha do keystore)
TXT
echo "backup ok: $ARQUIVO"
echo "SHA-256 confere com o original: $SHA_COPIA"
echo "Falta você: guardar o alias e as 2 senhas do keystore.env no seu gerenciador de senhas."

Cópia do modal e dos testes antes dos botões diretos de desbloqueio.

Para restaurar na raiz do projeto:

```sh
cp backups/plan-modal-before-direct-checkout/InsufficientCreditsModal.tsx.bak src/components/InsufficientCreditsModal.tsx
cp backups/plan-modal-before-direct-checkout/insufficientCreditsModal.test.tsx.bak src/components/insufficientCreditsModal.test.tsx
npm test
npm run build
```

Depois, publique a restauração normalmente pelo GitHub/Vercel.

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonthlySalesGoals } from '@/contexts/MonthlySalesGoalsContext';
import { useLicense } from '@/contexts/LicenseContext';
import type { SalesMonthlyGoal } from '@/types/metrics';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const filiais = [1, 2, 3]; // Placeholder; pode vir de API futuramente

const MenuGoals = () => {
  const { selectedLicenseId } = useLicense();
  const { goals, getGoal, createGoal, updateGoal, deleteGoal, refresh } = useMonthlySalesGoals();

  const now = new Date();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filialId, setFilialId] = useState<number>(1);
  const [ano, setAno] = useState<number>(now.getFullYear());
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [valorMeta, setValorMeta] = useState<number>(85000);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const empresaId = selectedLicenseId || '';

  const metasDaEmpresa = useMemo(() => goals.filter(g => g.empresaId === empresaId), [goals, empresaId]);

  const limparFormulario = () => {
    setEditingId(null);
    const n = new Date();
    setAno(n.getFullYear());
    setMes(n.getMonth() + 1);
    setFilialId(1);
    setValorMeta(85000);
  };

  const carregarParaEdicao = (meta: SalesMonthlyGoal) => {
    setEditingId(meta.id);
    setFilialId(meta.filialId);
    setAno(meta.ano);
    setMes(meta.mes);
    setValorMeta(meta.valorMeta);
  };

  const handleSubmit = async () => {
    if (!empresaId) {
      toast({ title: 'Selecione uma empresa', description: 'Nenhuma licença/empresa selecionada.', variant: 'destructive' });
      return;
    }

    if (!editingId) {
      // Create
      const conflict = getGoal(empresaId, filialId, ano, mes);
      if (conflict) {
        toast({ title: 'Meta já existe', description: 'Carregando meta existente para edição.' });
        carregarParaEdicao(conflict);
        return;
      }
      const created = await createGoal({ empresaId, filialId, ano, mes, valorMeta });
      if (created) {
        toast({ title: 'Meta criada', description: `Meta cadastrada para ${months[mes - 1].label}/${ano} - Filial ${filialId}.` });
        limparFormulario();
      }
    } else {
      // Update
      const updated = await updateGoal(editingId, { filialId, ano, mes, valorMeta });
      if (updated) {
        toast({ title: 'Meta atualizada', description: `Meta atualizada para ${months[mes - 1].label}/${ano} - Filial ${filialId}.` });
        limparFormulario();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteGoal(id);
    if (ok) toast({ title: 'Meta excluída', description: 'A meta foi removida com sucesso.' });
    if (editingId === id) limparFormulario();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metas Mensais de Vendas (Mês-Ano-Filial)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cadastre a meta mensal de faturamento por filial. A empresa é derivada da licença selecionada.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select value={String(filialId)} onValueChange={(v) => setFilialId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  {filiais.map(f => (
                    <SelectItem key={f} value={String(f)}>Filial {f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input type="number" value={ano} onChange={(e) => setAno(parseInt(e.target.value || '0', 10))} />
            </div>
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor da Meta</Label>
              <div className="flex items-center">
                <span className="mr-1">R$</span>
                <Input type="number" value={valorMeta} onChange={(e) => setValorMeta(parseFloat(e.target.value || '0'))} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>{editingId ? 'Salvar Alterações' : 'Cadastrar Meta'}</Button>
            {editingId && (
              <Button variant="outline" onClick={limparFormulario}>Cancelar</Button>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Metas cadastradas</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filial</TableHead>
                  <TableHead>Mês/Ano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[160px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metasDaEmpresa.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">Nenhuma meta cadastrada.</TableCell>
                  </TableRow>
                ) : (
                  metasDaEmpresa
                    .sort((a, b) => a.ano !== b.ano ? b.ano - a.ano : b.mes - a.mes)
                    .map(meta => (
                      <TableRow key={meta.id}>
                        <TableCell>Filial {meta.filialId}</TableCell>
                        <TableCell>{months[meta.mes - 1]?.label}/{meta.ano}</TableCell>
                        <TableCell>R$ {meta.valorMeta.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => carregarParaEdicao(meta)}>Editar</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(meta.id)}>Excluir</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuGoals;

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MatchSet {
  sourceName: string
  leftLines: string[]
  rightLines: string[]
  leftMatches: number[]
  rightMatches: number[]
}

interface ComparisonViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  similarity?: number | null
  matches?: MatchSet[]
  fileName?: string
}

export function ComparisonView({ open, onOpenChange, similarity, matches = [], fileName }: ComparisonViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Plagiarism Summary</div>
              <div className="text-sm text-muted-foreground">{fileName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Similarity</div>
              <div className={`text-xl font-bold ${similarity && similarity > 30 ? 'text-destructive' : 'text-emerald-600'}`}>{similarity ?? '--'}%</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-2 pb-4">
          {matches.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No match details available.</div>
          ) : (
            matches.map((m, idx) => (
              <div key={idx} className="rounded-md border border-border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-medium">Matched with: {m.sourceName}</div>
                  <Badge className="bg-muted/30">{m.leftMatches.length} matched lines</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="mb-2 text-xs text-muted-foreground">Original</div>
                    <div className="rounded-md border bg-background p-2">
                      {m.leftLines.map((line, i) => {
                        const isMatch = m.leftMatches.includes(i + 1)
                        return (
                          <div key={i} className={`whitespace-pre-wrap ${isMatch ? 'bg-yellow-200 px-1' : ''}`}>
                            {line}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="mb-2 text-xs text-muted-foreground">Source: {m.sourceName}</div>
                    <div className="rounded-md border bg-background p-2">
                      {m.rightLines.map((line, i) => {
                        const isMatch = m.rightMatches.includes(i + 1)
                        return (
                          <div key={i} className={`whitespace-pre-wrap ${isMatch ? 'bg-yellow-200 px-1' : ''}`}>
                            {line}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ComparisonView

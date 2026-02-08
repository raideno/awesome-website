export interface PatternProps {}

export const Pattern: React.FC<PatternProps> = () => {
  return (
    <>
      <style>
        {`
        .pattern {
            position: fixed;
            pointer-events: none;
            inset: calc(var(--spacing) * 0);
            height: 100vh;
            width: 100vw;
            opacity: 0.05;
            background-image:
                linear-gradient(#000000 1px, transparent 1px),
                linear-gradient(to right, #000000 1px, #e5e5f7 1px);
            background-size: 20px 20px;
        }
        `}
      </style>
      <div className="pattern"></div>
    </>
  )
}

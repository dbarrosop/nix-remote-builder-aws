{
  description = "Github Action to deploy nix remote builders on demand";

  inputs = {
    nixops.url = "github:nhost/nixops";
    nixpkgs.follows = "nixops/nixpkgs";
    flake-utils.follows = "nixops/flake-utils";
    nix-filter.follows = "nixops/nix-filter";

  };

  outputs = { self, nixops, nixpkgs, flake-utils, nix-filter }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [
          nixops.overlays.default
        ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };


        buildInputs = with pkgs; [
          nodejs
          nodePackages.npm
        ];

        nativeBuildInputs = with pkgs; [
        ];

        src = ./.;

        nix-src = nix-filter.lib.filter {
          root = ./.;
          include = [
            (nix-filter.lib.matchExt "nix")
          ];
        };
      in
      {

        checks = {
          nixpkgs-fmt = pkgs.runCommand "check-nixpkgs-fmt"
            {
              nativeBuildInputs = with pkgs;
                [
                  nixpkgs-fmt
                ];
            }
            ''
              mkdir $out
              nixpkgs-fmt --check ${nix-src}
            '';
        };

        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nixpkgs-fmt
          ] ++ buildInputs ++ nativeBuildInputs;
        };

      }

    );

}

def get_version() -> str:
    """Read the version from the VERSION file."""
    with open("../VERSION", encoding="utf-8") as f:
        return f.read().strip()

__version__ = get_version()